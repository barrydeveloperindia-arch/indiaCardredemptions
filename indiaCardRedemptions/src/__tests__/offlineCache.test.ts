import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheTransferMatrix, getMatrixWithOfflineFallback } from '../utils/offlineCache';
import staticMatrix from '../constants/transferMatrix.json';

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve();
      }),
      getItem: jest.fn((key: string) => {
        return Promise.resolve(store[key] || null);
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
    },
  };
});

describe('Local Matrix Offline Cache Fallback', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should save the transfer matrix in AsyncStorage', async () => {
    const testMatrix = { test: 'data' };
    await cacheTransferMatrix(testMatrix);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'TRANSFER_MATRIX_CACHE_KEY',
      JSON.stringify(testMatrix)
    );
  });

  it('should use network results and update the cache when network is online', async () => {
    const networkResult = { online: true };
    const networkFetch = jest.fn().mockResolvedValue(networkResult);

    const result = await getMatrixWithOfflineFallback(networkFetch);
    expect(result).toEqual(networkResult);
    expect(networkFetch).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'TRANSFER_MATRIX_CACHE_KEY',
      JSON.stringify(networkResult)
    );
  });

  it('should fall back to cached matrix if network fetch fails', async () => {
    const cachedMatrix = { cached: true };
    await AsyncStorage.setItem('TRANSFER_MATRIX_CACHE_KEY', JSON.stringify(cachedMatrix));

    const networkFetch = jest.fn().mockRejectedValue(new Error('Network offline'));

    const result = await getMatrixWithOfflineFallback(networkFetch);
    expect(result).toEqual(cachedMatrix);
    expect(networkFetch).toHaveBeenCalled();
  });

  it('should fall back to static transferMatrix.json if network fails and cache is empty', async () => {
    const networkFetch = jest.fn().mockRejectedValue(new Error('Network offline'));

    const result = await getMatrixWithOfflineFallback(networkFetch);
    expect(result).toEqual(staticMatrix);
  });
});
