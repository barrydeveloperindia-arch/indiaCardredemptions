import AsyncStorage from '@react-native-async-storage/async-storage';
import staticMatrix from '../constants/transferMatrix.json';

export const TRANSFER_MATRIX_CACHE_KEY = 'TRANSFER_MATRIX_CACHE_KEY';

/**
 * Saves a transfer matrix object to local offline storage.
 * 
 * @param matrix The transfer matrix data to cache
 */
export async function cacheTransferMatrix(matrix: any): Promise<void> {
  await AsyncStorage.setItem(TRANSFER_MATRIX_CACHE_KEY, JSON.stringify(matrix));
}

/**
 * Attempts to fetch the latest transfer matrix from network, falling back to
 * AsyncStorage or local JSON definitions if offline.
 * 
 * @param networkFetch The async function executing the network request
 * @returns The active transfer matrix payload
 */
export async function getMatrixWithOfflineFallback(
  networkFetch: () => Promise<any>
): Promise<any> {
  try {
    const data = await networkFetch();
    await cacheTransferMatrix(data);
    return data;
  } catch {
    const cached = await AsyncStorage.getItem(TRANSFER_MATRIX_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    return staticMatrix;
  }
}
