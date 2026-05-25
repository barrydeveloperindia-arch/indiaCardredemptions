import {
  rateLimiter,
  stripe3DSGating,
  verifyJwtOwnership,
  enforceIdempotency,
  deductPointsTransaction,
  redisCacheMiddleware,
  ipRequestCounts,
  idempotencyKeys,
  redisCache,
  userBalances,
  handleFlightBooking
} from './server';
import jwt from 'jsonwebtoken';

describe('Backend Express Security Middlewares', () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    ipRequestCounts.clear();
    idempotencyKeys.clear();
    redisCache.clear();
    userBalances.set('user_01', 50000);

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('10.1: Rate Limiter & Stripe 3DS Gating', () => {
    it('should allow requests within rate limit window', () => {
      mockRequest.ip = '127.0.0.1';
      rateLimiter(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject requests exceeding rate limit threshold', () => {
      mockRequest.ip = '127.0.0.1';
      // Simulate 101 requests from same IP
      ipRequestCounts.set('127.0.0.1', { count: 101, resetTime: Date.now() + 10000 });

      rateLimiter(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });

    it('should reset rate limit after reset window passes', () => {
      mockRequest.ip = '127.0.0.1';
      ipRequestCounts.set('127.0.0.1', { count: 101, resetTime: Date.now() - 1000 });

      rateLimiter(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should gate checkout if requires3DS is true but paymentMethodId is missing', () => {
      mockRequest.body = { requires3DS: true };
      stripe3DSGating(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ requires_action: true })
      );
    });

    it('should proceed if 3DS check is satisfied', () => {
      mockRequest.body = { requires3DS: true, paymentMethodId: 'pm_123' };
      stripe3DSGating(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('10.2: JWT BOLA/IDOR Ownership Verification', () => {
    const JWT_SECRET = 'super_secret_points_array_key';

    it('should deny access if authorization header is missing', () => {
      mockRequest.headers = {};
      verifyJwtOwnership(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should authorize if token matches requested resource owner', () => {
      const token = jwt.sign({ userId: 'user_01', role: 'user' }, JWT_SECRET);
      mockRequest.headers = { authorization: `Bearer ${token}` };
      mockRequest.params = { userId: 'user_01' };

      verifyJwtOwnership(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user.userId).toBe('user_01');
    });

    it('should allow admin to bypass BOLA mismatch checks', () => {
      const token = jwt.sign({ userId: 'admin_01', role: 'admin' }, JWT_SECRET);
      mockRequest.headers = { authorization: `Bearer ${token}` };
      mockRequest.params = { userId: 'user_01' };

      verifyJwtOwnership(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject access (BOLA violation) if token does not match owner', () => {
      const token = jwt.sign({ userId: 'user_02', role: 'user' }, JWT_SECRET);
      mockRequest.headers = { authorization: `Bearer ${token}` };
      mockRequest.params = { userId: 'user_01' };

      verifyJwtOwnership(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should reject access if token is invalid or expired', () => {
      mockRequest.headers = { authorization: 'Bearer invalid_token' };
      verifyJwtOwnership(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe('10.4: Idempotency enforcement & database transactions', () => {
    it('should error out if missing Idempotency-Key header', () => {
      mockRequest.headers = {};
      enforceIdempotency(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should record idempotency key and proceed', () => {
      mockRequest.headers = { 'idempotency-key': 'idemp_key_01' };
      enforceIdempotency(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(idempotencyKeys.has('idemp_key_01')).toBe(true);
    });

    it('should reject duplicate requests with identical idempotency key', () => {
      idempotencyKeys.add('idemp_key_01');
      mockRequest.headers = { 'idempotency-key': 'idemp_key_01' };
      enforceIdempotency(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(409);
    });

    it('should deduct points in transaction lock', async () => {
      const success = await deductPointsTransaction('user_01', 20000);
      expect(success).toBe(true);
      expect(userBalances.get('user_01')).toBe(30000);
    });

    it('should block double-spending if balances are insufficient', async () => {
      const success = await deductPointsTransaction('user_01', 60000);
      expect(success).toBe(false);
      expect(userBalances.get('user_01')).toBe(50000);
    });
  });

  describe('10.5: Redis Query Caching Proxy', () => {
    it('should return cached data if cache key exists and not expired', () => {
      mockRequest.originalUrl = '/api/flights';
      redisCache.set('/api/flights', {
        data: { flight: 'BOM-SIN' },
        expiry: Date.now() + 10000,
      });

      redisCacheMiddleware(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ flight: 'BOM-SIN', _cached: true })
      );
    });

    it('should pass request to next and cache response data if cache is empty', () => {
      mockRequest.originalUrl = '/api/flights';
      mockResponse.statusCode = 200;

      redisCacheMiddleware(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalled();

      // Trigger interceptor res.json
      mockResponse.json({ flights: 'new_result' });
      expect(redisCache.has('/api/flights')).toBe(true);
    });
  });

  describe('Concierge Flight Booking API Endpoints', () => {
    let mockReq: any;
    let mockRes: any;
    const JWT_SECRET = 'super_secret_points_array_key';

    beforeEach(() => {
      userBalances.set('user_01', 100000);
      mockReq = {
        headers: { 'idempotency-key': 'new_idemp_key_99' },
        body: {
          userId: 'user_01',
          points: 50000,
          conciergeFee: 25000,
          routes: [{ origin: 'DEL', destination: 'LHR' }],
          passengers: { adults: 1, children: 0 }
        }
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
    });

    it('should reject booking if routes or passengers are missing', async () => {
      mockReq.body = { userId: 'user_01', points: 10000 };

      await handleFlightBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Missing route or passenger details') })
      );
    });

    it('should reject booking if points balance is insufficient', async () => {
      mockReq.body.points = 200000; // Exceeds balance

      await handleFlightBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Insufficient points balance') })
      );
    });

    it('should complete booking successfully when all inputs and balances are valid', async () => {
      await handleFlightBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Concierge flight booking initialized'),
          bookingId: expect.any(String)
        })
      );
    });
  });
});
