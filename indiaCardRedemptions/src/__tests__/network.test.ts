import { getNetworkState } from '../utils/network';

describe('Custom Network Connection Check Utility', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it('should return isConnected: true when fetch resolves successfully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as any);

    const state = await getNetworkState();
    expect(state.isConnected).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://www.google.com',
      expect.objectContaining({ method: 'HEAD' })
    );
  });

  it('should return isConnected: false when fetch rejects with an error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network disconnected'));

    const state = await getNetworkState();
    expect(state.isConnected).toBe(false);
  });

  it('should return isConnected: false when fetch aborts or times out', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error('AbortError');
    });

    const state = await getNetworkState();
    expect(state.isConnected).toBe(false);
  });

  it('should trigger controller abort on timeout and return isConnected: false', async () => {
    jest.useFakeTimers();
    
    // Mock fetch to reject when the signal is aborted
    global.fetch = jest.fn().mockImplementation((url, options) => {
      return new Promise((resolve, reject) => {
        if (options?.signal) {
          options.signal.addEventListener('abort', () => {
            reject(new Error('AbortError'));
          });
        }
      });
    });

    const statePromise = getNetworkState();
    
    // Fast-forward timers past the 2000ms threshold
    jest.advanceTimersByTime(2500);
    
    const state = await statePromise;
    expect(state.isConnected).toBe(false);
  });
});
