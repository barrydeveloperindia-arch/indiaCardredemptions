/**
 * Network state monitoring utility using lightweight HEAD requests to avoid external native dependencies.
 */

/**
 * Checks if the device has internet access by performing a lightweight fetch request.
 * 
 * @returns Promise resolving to connection state object
 */
export async function getNetworkState(): Promise<{ isConnected: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    // Perform a lightweight HEAD request to a reliable public host
    await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    return { isConnected: true };
  } catch {
    return { isConnected: false };
  }
}
