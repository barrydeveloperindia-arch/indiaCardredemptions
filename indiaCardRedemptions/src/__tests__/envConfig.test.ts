import { getApiCredentials } from '../utils/envConfig';

describe('Secure Dotenv Configuration Management', () => {
  const originalDuffel = process.env.EXPO_PUBLIC_DUFFEL_TOKEN;
  const originalGemini = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DUFFEL_TOKEN = originalDuffel;
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = originalGemini;
  });

  it('should retrieve API credentials from environment variables correctly', () => {
    process.env.EXPO_PUBLIC_DUFFEL_TOKEN = 'test_duffel_token';
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test_gemini_key';

    const credentials = getApiCredentials();
    expect(credentials.duffelToken).toBe('test_duffel_token');
    expect(credentials.geminiApiKey).toBe('test_gemini_key');
  });

  it('should fall back to empty strings if environment variables are not set', () => {
    delete process.env.EXPO_PUBLIC_DUFFEL_TOKEN;
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    const credentials = getApiCredentials();
    expect(credentials.duffelToken).toBe('');
    expect(credentials.geminiApiKey).toBe('');
  });
});
