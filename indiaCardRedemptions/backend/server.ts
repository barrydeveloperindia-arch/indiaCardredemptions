import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { fetchAndParseDeals } from './dealsScraper';
import { pointSales } from '../src/data/pointSales';
import { getInstagramRssFeed, getInstagramJsonFeed } from './instagramScraper';

const app = express();

// CORS middleware to allow Expo web client cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Idempotency-Key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// In-Memory Simulation databases and caches
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_points_array_key';
const idempotencyKeys = new Set<string>();
const redisCache = new Map<string, { data: any; expiry: number }>();
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const userBalances = new Map<string, number>([
  ['user_01', 50000],
  ['user_02', 12000],
]);

// Interface extensions for custom Express request properties
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// ==========================================
// 10.1: Express API Rate-Limiter & Stripe 3DS gating
// ==========================================
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || 'unknown_ip';
  const now = Date.now();
  const limitWindow = 60 * 1000; // 1 minute window
  const maxRequests = 100; // Max 100 requests per minute

  const record = ipRequestCounts.get(ip);
  if (!record || now > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + limitWindow });
    return next();
  }

  record.count += 1;
  if (record.count > maxRequests) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  return next();
}

export function stripe3DSGating(req: Request, res: Response, next: NextFunction) {
  const { paymentMethodId, requires3DS } = req.body;
  if (requires3DS && !paymentMethodId) {
    return res.status(400).json({
      error: 'Stripe 3DS Gating Alert',
      requires_action: true,
      payment_intent_client_secret: 'pi_3Ds_gated_secret_token_123',
    });
  }
  return next();
}

// ==========================================
// 10.2: JWT Ownership Verification Middleware
// ==========================================
export function verifyJwtOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.user = decoded;

    // BOLA/IDOR Defense: Verify requested resource matches authenticated token ownership
    const requestedUserId = req.params.userId || req.body.userId;
    if (requestedUserId && requestedUserId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'BOLA Violation: Access denied to requested user resource' });
    }

    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ==========================================
// 10.4: Idempotency-Key headers & database locking
// ==========================================
export async function enforceIdempotency(req: Request, res: Response, next: NextFunction) {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Missing Idempotency-Key header' });
  }

  if (idempotencyKeys.has(idempotencyKey)) {
    return res.status(409).json({
      error: 'Conflict: Duplicate request detected for this Idempotency-Key',
    });
  }

  idempotencyKeys.add(idempotencyKey);
  return next();
}

// Simulated Row-level transactional lock for double-spend protection
export async function deductPointsTransaction(userId: string, points: number): Promise<boolean> {
  // Simulate transactional BEGIN / LOCK
  const balance = userBalances.get(userId);
  if (balance === undefined || balance < points) {
    return false;
  }
  // Deduct under lock simulation
  userBalances.set(userId, balance - points);
  return true;
}

// ==========================================
// 10.5: Redis Query Caching Engine Simulator
// ==========================================
export function redisCacheMiddleware(req: Request, res: Response, next: NextFunction) {
  const cacheKey = req.originalUrl || req.url;
  const cached = redisCache.get(cacheKey);
  const now = Date.now();

  if (cached && now < cached.expiry) {
    return res.status(200).json({
      ...cached.data,
      _cached: true,
    });
  }

  // Override res.json to cache response data before sending
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    if (res.statusCode === 200) {
      redisCache.set(cacheKey, {
        data: body,
        expiry: Date.now() + 60 * 1000, // Cache for 1 minute
      });
    }
    return originalJson(body);
  };

  return next();
}

// API Route Hookups
let cachedDeals: any[] | null = null;
let dealsCacheExpiry = 0;
const DEALS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

app.get('/api/deals', async (_req, res) => {
  const now = Date.now();
  if (cachedDeals && now < dealsCacheExpiry) {
    return res.json({ deals: cachedDeals, _cached: true });
  }

  try {
    const liveDeals = await fetchAndParseDeals();
    if (liveDeals && liveDeals.length > 0) {
      const livePartners = new Set(liveDeals.map(d => d.partner));
      const filteredStatic = pointSales.filter(s => !livePartners.has(s.partner));
      const mergedDeals = [...liveDeals, ...filteredStatic];

      cachedDeals = mergedDeals;
      dealsCacheExpiry = now + DEALS_CACHE_TTL;
      return res.json({ deals: mergedDeals, _cached: false });
    }
  } catch (err) {
    console.error('Failed to retrieve live deals feed, falling back to static pointsSales:', err);
  }

  // Fallback to static mock pointSales if scraper fails or returns no deals
  return res.json({ deals: pointSales, _cached: false, _fallback: true });
});

app.get('/api/rss/instagram', async (_req, res) => {
  try {
    const xml = await getInstagramRssFeed();
    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('Failed to generate Instagram RSS feed:', err);
    return res.status(500).json({ error: 'Failed to generate RSS feed' });
  }
});

app.get('/api/instagram', async (_req, res) => {
  try {
    const posts = await getInstagramJsonFeed();
    return res.status(200).json({ posts });
  } catch (err) {
    console.error('Failed to generate Instagram JSON feed:', err);
    return res.status(500).json({ error: 'Failed to generate JSON feed' });
  }
});

app.get('/api/search/flights', rateLimiter, redisCacheMiddleware, (_req, res) => {
  res.json({
    flights: [
      { id: '1', origin: 'BOM', destination: 'LHR', miles: 45000 },
      { id: '2', origin: 'DEL', destination: 'SIN', miles: 30000 },
    ],
  });
});

export async function handleFlightBooking(req: AuthenticatedRequest, res: Response) {
  const { userId, points, conciergeFee, routes, passengers } = req.body;
  
  if (!routes || !passengers) {
    return res.status(400).json({ error: 'Missing route or passenger details' });
  }

  const success = await deductPointsTransaction(userId, points);

  if (!success) {
    return res.status(400).json({ error: 'Insufficient points balance or transaction failed' });
  }

  return res.status(201).json({
    message: 'Concierge flight booking initialized',
    bookingId: 'fl_bk_' + Math.floor(100000 + Math.random() * 900000),
    conciergeFeeCharged: conciergeFee,
    status: 'pending_issuance'
  });
}

app.post('/api/bookings/flight', rateLimiter, verifyJwtOwnership, enforceIdempotency, stripe3DSGating, handleFlightBooking);

const isMain = process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));
if (isMain) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
}

export { app, ipRequestCounts, idempotencyKeys, redisCache, userBalances };
