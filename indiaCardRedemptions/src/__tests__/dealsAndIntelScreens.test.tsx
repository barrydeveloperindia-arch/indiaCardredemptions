import React from 'react';
import { render } from '@testing-library/react-native';
import DealsScreen from '../app/deals';
import IntelScreen from '../app/intel';
import { WalletProvider } from '../context/WalletContext';

// Mocks
jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: (props: any) => React.createElement(View, props),
  };
});

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => React.createElement(View, props),
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View: (props: any) => React.createElement(View, props),
    },
    FadeInDown: { delay: () => ({ springify: () => {} }) },
    FadeIn: { duration: () => ({ springify: () => {} }) },
    SlideInRight: { delay: () => ({ springify: () => {} }) },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withRepeat: jest.fn(),
    withTiming: jest.fn(),
    withSequence: jest.fn(),
    withDelay: jest.fn(),
    Easing: { linear: jest.fn() },
  };
});

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: (props: any) => React.createElement(View, props),
  };
});

describe('DealsScreen Visual Layout [FT-105_DealsScreen]', () => {
  it('should render page headers and active buy deals list with purchase recommendations', () => {
    const { getByText } = render(
      <WalletProvider>
        <DealsScreen />
      </WalletProvider>
    );

    expect(getByText('LIVE POINTS SALES TRACKER')).toBeTruthy();
    expect(getByText('Active Buy Deals')).toBeTruthy();
    expect(getByText(/A dynamic ledger of live airline and hotel point sales/i)).toBeTruthy();

    // Verify list items cost calculation rates are rendering
    expect(getByText('Hilton Honors')).toBeTruthy();
    expect(getByText('Qatar Privilege Club')).toBeTruthy();
  });
});

describe('Live Deals RSS Feed [FT-109_LiveDealsFeed]', () => {
  let originalFetch: any;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should fetch dynamic deals from backend and render them successfully', async () => {
    const mockDeals = [
      {
        id: 'virgin_70_feed',
        partner: 'Virgin Atlantic',
        bonusPercentage: 70,
        basePointsBought: 10000,
        bonusPointsReceived: 7000,
        totalUsdCost: 226,
        endDate: 'June 30, 2026',
        description: 'Virgin Atlantic Flying Club 70% buy bonus deal parsed from RSS feed.'
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ deals: mockDeals }),
      })
    ) as jest.Mock;

    const { findByText } = render(
      <WalletProvider>
        <DealsScreen />
      </WalletProvider>
    );

    const dynamicDeal = await findByText('Virgin Atlantic');
    expect(dynamicDeal).toBeTruthy();
    expect(await findByText('70% BONUS')).toBeTruthy();
    expect(await findByText(/Virgin Atlantic Flying Club 70%/i)).toBeTruthy();
  });

  it('should fall back to offline pointsSales when backend fetch fails', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.reject(new Error('Fetch failed'))
    ) as jest.Mock;

    const { getByText } = render(
      <WalletProvider>
        <DealsScreen />
      </WalletProvider>
    );

    expect(getByText('Hilton Honors')).toBeTruthy();
    expect(getByText('Qatar Privilege Club')).toBeTruthy();
  });
});

describe('IntelScreen Visual Layout [FT-106_IntelScreen]', () => {
  let originalFetch: any;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should render devaluations and unannounced updates with impact boxes', () => {
    const { getByText, queryAllByText } = render(<IntelScreen />);

    expect(getByText('THE INDIAN POINTS ARRAY INTEL')).toBeTruthy();
    expect(getByText('The Latest Intelligence')).toBeTruthy();

    // Devaluations unannounced alert badges
    const devalBadges = queryAllByText('DEVALUATION');
    expect(devalBadges.length).toBeGreaterThan(0);

    // Sweet Spot unannounced alert badges
    const sweetSpotBadges = queryAllByText('SWEET SPOT');
    expect(sweetSpotBadges.length).toBeGreaterThan(0);

    // Tactical impact boxes
    const impactLabels = queryAllByText('TACTICAL IMPACT');
    expect(impactLabels.length).toBeGreaterThan(0);
  });

  it('should render tab switchers and default to ecosystem alerts', () => {
    const { getByText, queryByText } = render(<IntelScreen />);
    expect(getByText('ECOSYSTEM ALERTS')).toBeTruthy();
    expect(getByText('INSTAGRAM FEED')).toBeTruthy();
    // Should show static alert first
    expect(getByText('Axis Atlas Excludes BharatNXT & Pice')).toBeTruthy();
    // Should NOT show Instagram posts yet
    expect(queryByText('INSTAGRAM')).toBeNull();
  });

  it('should fetch and render Instagram feed items when tab is switched', async () => {
    const mockPosts = [
      {
        title: 'Mock Hyatt Post',
        link: 'https://www.instagram.com/p/mock_hyatt',
        description: 'Unlock Hyatt Globalist status with just 20 nights.',
        pubDate: 'Mon, 08 Jun 2026 06:30:00 GMT'
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ posts: mockPosts }),
      })
    ) as jest.Mock;

    const { getByText, findByText, queryByText } = render(<IntelScreen />);

    const instagramTab = getByText('INSTAGRAM FEED');
    // Simulate press
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(instagramTab);

    // Wait and verify instagram post elements
    const postTitle = await findByText('Mock Hyatt Post');
    expect(postTitle).toBeTruthy();
    expect(getByText('INSTAGRAM')).toBeTruthy();
    expect(getByText(/Unlock Hyatt Globalist/)).toBeTruthy();
    expect(getByText('VIEW ON INSTAGRAM')).toBeTruthy();

    // Verify static alert is no longer showing
    expect(queryByText('Axis Atlas Excludes BharatNXT & Pice')).toBeNull();
  });
});
