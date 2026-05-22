export interface ApiCredentials {
  duffelToken: string;
  geminiApiKey: string;
}

/**
 * Safely extracts environment credentials for travel search and concierge AI endpoints.
 * Falls back to empty string parameters if not set.
 * 
 * @returns An object containing mapped API keys and tokens
 */
export function getApiCredentials(): ApiCredentials {
  return {
    duffelToken: process.env.EXPO_PUBLIC_DUFFEL_TOKEN || '',
    geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  };
}
