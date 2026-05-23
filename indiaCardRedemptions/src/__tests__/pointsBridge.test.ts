import { getBankTransferUrl, getPartnerSearchUrl, copyToClipboard } from '../utils/bridgeHelper';
import { Linking, Clipboard } from 'react-native';

describe('Points-to-Booking Bridge Helpers', () => {
  let openUrlSpy: jest.SpyInstance;
  let setStringSpy: jest.SpyInstance;

  beforeAll(() => {
    openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    setStringSpy = jest.spyOn(Clipboard, 'setString').mockImplementation(() => {});
  });

  afterAll(() => {
    openUrlSpy.mockRestore();
    setStringSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should map card IDs to correct bank rewards portals', () => {
    expect(getBankTransferUrl('axis_atlas')).toBe('https://edgerewards.axisbank.co.in/');
    expect(getBankTransferUrl('amex_platinum')).toBe('https://www.americanexpress.com/in/rewards/');
    expect(getBankTransferUrl('hsbc_premier')).toBe('https://www.hsbc.co.in/credit-cards/rewards/');
    expect(getBankTransferUrl('hdfc_infinia')).toBe('https://www.hdfcrewards.com/');
    expect(getBankTransferUrl('other_card')).toBe('https://edgerewards.axisbank.co.in/');
  });

  it('should map partner loyalty names to correct reward search deep-links', () => {
    expect(getPartnerSearchUrl('Marriott Bonvoy')).toBe('https://www.marriott.com/reservation/search.mi?isRewardPlay=true');
    expect(getPartnerSearchUrl('Singapore KrisFlyer')).toBe('https://www.singaporeair.com/en_UK/ppsclub-krisflyer/use-miles/redeem-flights/');
    expect(getPartnerSearchUrl('Accor Live Limitless')).toBe('https://all.accor.com/loyalty-program/reasonstojoin/index.en.shtml');
    expect(getPartnerSearchUrl('unknown_loyalty')).toBe('https://www.marriott.com/reservation/search.mi?isRewardPlay=true');
  });

  it('should copy text strings to clipboard successfully', async () => {
    const success = await copyToClipboard('15000');
    expect(success).toBe(true);
    expect(setStringSpy).toHaveBeenCalledWith('15000');
  });

  it('should catch exceptions and return false on copy failure', async () => {
    setStringSpy.mockImplementationOnce(() => {
      throw new Error('Clipboard error');
    });
    const success = await copyToClipboard('15000');
    expect(success).toBe(false);
  });
});
