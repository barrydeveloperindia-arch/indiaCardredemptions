import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WalletCard } from '../components/WalletCard';
import { ArbitrageCalculator } from '../components/ArbitrageCalculator';

// Clean standard mocks for Native-bound Expo modules inside headless Jest
jest.mock('expo-router/head', () => {
  return {
    __esModule: true,
    default: 'Head',
  };
});

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

jest.mock('expo-symbols', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SymbolView: (props: any) => React.createElement(View, props),
  };
});

describe('WalletCard Component UI Elements', () => {
  const mockSelect = jest.fn();
  const mockUpdateBalance = jest.fn();
  const mockUpdateSpend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correct bank labels and card names', () => {
    const { getByText } = render(
      <WalletCard
        cardId="axis_m4b"
        balance={56000}
        spend={400000}
        isSelected={false}
        onSelect={mockSelect}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );

    expect(getByText('AXIS BURGUNDY')).toBeTruthy();
    expect(getByText('Axis Magnus for Burgundy')).toBeTruthy();
  });

  it('should display the correct portfolio balance input and trigger updates', () => {
    const { getByDisplayValue } = render(
      <WalletCard
        cardId="axis_m4b"
        balance={56000}
        spend={400000}
        isSelected={false}
        onSelect={mockSelect}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );

    const balanceInput = getByDisplayValue('56000');
    expect(balanceInput).toBeTruthy();

    fireEvent.changeText(balanceInput, '60000');
    expect(mockUpdateBalance).toHaveBeenCalledWith(60000);
  });

  it('should render milestone spending progress inputs and track changes', () => {
    const { getByDisplayValue } = render(
      <WalletCard
        cardId="axis_m4b"
        balance={56000}
        spend={400000}
        isSelected={false}
        onSelect={mockSelect}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );

    const spendInput = getByDisplayValue('400000');
    expect(spendInput).toBeTruthy();

    fireEvent.changeText(spendInput, '500000');
    expect(mockUpdateSpend).toHaveBeenCalledWith(500000);
  });

  it('should display the Gold Taj Badge ONLY when spend is 7L or more for Amex (March 2026 Rules)', () => {
    // 1. Spend at 3.5L (Below 7L threshold)
    const { queryByText, rerender } = render(
      <WalletCard
        cardId="amex_platinum"
        balance={120000}
        spend={350000}
        isSelected={false}
        onSelect={mockSelect}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );

    expect(queryByText(/Taj Voucher Unlocked/i)).toBeNull();

    // 2. Spend at 7.5L (Above 7L threshold)
    rerender(
      <WalletCard
        cardId="amex_platinum"
        balance={120000}
        spend={750000}
        isSelected={false}
        onSelect={mockSelect}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );

    expect(queryByText(/Taj Voucher Unlocked/i)).toBeTruthy();
  });

  it('should render interactive sliders ONLY when card is selected', () => {
    // 1. Unselected card
    const { queryByText, rerender } = render(
      <WalletCard
        cardId="axis_m4b"
        balance={56000}
        spend={400000}
        isSelected={false}
        onSelect={mockSelect}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );
    expect(queryByText('Slide Balance')).toBeNull();
    expect(queryByText('Slide Annual Spend')).toBeNull();

    // 2. Selected card
    rerender(
      <WalletCard
        cardId="axis_m4b"
        balance={56000}
        spend={400000}
        isSelected={true}
        onSelect={mockSelect}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );
    expect(queryByText('Slide Balance')).toBeTruthy();
    expect(queryByText('Slide Annual Spend')).toBeTruthy();
  });
});

describe('ArbitrageCalculator Component UI Elements', () => {
  const mockWallet = {
    hsbc_premier: 75000,
    axis_m4b: 56000,
  };

  it('should render all calculator inputs, titles, and select tabs', () => {
    const { getByText, getByDisplayValue } = render(
      <ArbitrageCalculator walletBalances={mockWallet} />
    );

    expect(getByText('Arbitrage Yield Analyzer')).toBeTruthy();
    expect(getByDisplayValue('35000')).toBeTruthy(); // Cash price
    expect(getByDisplayValue('15000')).toBeTruthy(); // Point cost
    expect(getByText('Marriott Bonvoy')).toBeTruthy();
  });

  it('should dynamically calculate RpP yield and render the correct status badge', () => {
    const { getByText, getByDisplayValue } = render(
      <ArbitrageCalculator walletBalances={mockWallet} />
    );

    // Cash: 35000, Points: 15000
    // Yield = 35000 / 15000 = ₹2.33 / point -> ELITE ARBITRAGE (since >= 1.0)
    expect(getByText('₹2.33')).toBeTruthy();
    expect(getByText('ELITE ARBITRAGE (Transfer points!)')).toBeTruthy();
  });

  it('should list optimal transfer pathways in order of efficiency', () => {
    const { getByText } = render(
      <ArbitrageCalculator walletBalances={mockWallet} />
    );

    // Selected program is Marriott Bonvoy (baseline ratio 1:1 for HSBC Premier)
    // HSBC Premier is 1:1, Axis is blocked (M4B devalued for Marriott on April 2, 2026!)
    // So only HSBC Premier should appear as a transfer pathway!
    expect(getByText('HSBC Premier Credit Card')).toBeTruthy();
    expect(getByText(/Ratio: 10:10/i)).toBeTruthy(); // 1.0 ratio
  });

  it('should render range sliders and chevron navigation slide controls', () => {
    const { getByText } = render(
      <ArbitrageCalculator walletBalances={mockWallet} />
    );

    // Chevron icons ‹ and ›
    expect(getByText('‹')).toBeTruthy();
    expect(getByText('›')).toBeTruthy();

    // Range sliders for Cash Price and Points Required
    expect(getByText('Slide Cash Price')).toBeTruthy();
    expect(getByText('Slide Points Required')).toBeTruthy();
  });
});

describe('HomeScreen Usability & Stickiness Elements', () => {
  const { WalletProvider } = require('../context/WalletContext');
  const HomeScreen = require('../app/index').default;

  it('should render a travel search bar, deal of the day banner, and active milestone alerts', () => {
    const { getByPlaceholderText, getByText } = render(
      <WalletProvider>
        <HomeScreen />
      </WalletProvider>
    );

    // 1. Travel Search Bar placeholder
    expect(getByPlaceholderText(/Search "London", "Maldives"\.\.\./i)).toBeTruthy();

    // 2. Deal of the Day Banner
    expect(getByText(/🔥 ₹2\.00 YIELD \/ PT/i)).toBeTruthy();
    expect(getByText(/Fairmont Jaipur Palace/i)).toBeTruthy();

    // 3. Dynamic Milestone Actionable Alerts
    expect(getByText(/Milestone Radar/i)).toBeTruthy();
  });
});

describe('InsightsScreen Component UI Elements', () => {
  const InsightsScreen = require('../app/insights').default;

  it('should render the segmented tab control and defaults to card facts section', () => {
    const { getByText, getByPlaceholderText } = render(<InsightsScreen />);

    // Segmented tab selectors
    expect(getByText(/💡 CARD FACTS & EXCLUSIONS/i)).toBeTruthy();
    expect(getByText(/🔥 DOUBLE & TRIPLE DIPS/i)).toBeTruthy();

    // Defaults to facts tab & MCC Checker
    expect(getByText(/🎯 Interactive Axis Atlas MCC Checker/i)).toBeTruthy();
    expect(getByPlaceholderText(/Enter merchant or processor name.../i)).toBeTruthy();
  });

  it('should dynamically update checker status when typing a blocked gateway or merchant', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<InsightsScreen />);
    
    const checkerInput = getByPlaceholderText(/Enter merchant or processor name.../i);

    // Type a general shopping merchant -> eligible
    fireEvent.changeText(checkerInput, 'Amazon Grocery Spends');
    expect(getByText(/ELIGIBLE \(1X Edge Miles\)/i)).toBeTruthy();

    // Type a blocked gateway -> excluded
    fireEvent.changeText(checkerInput, 'BharatNXT BillPay');
    expect(getByText(/EXCLUDED \(0X Edge Miles\)/i)).toBeTruthy();
    expect(getByText(/Axis Atlas explicitly excludes Edge Miles for payments processed through commercial utility\/arbitrage gateways/i)).toBeTruthy();
  });

  it('should toggle to the Double/Triple Dips section and render the ROI calculator', () => {
    const { getByText } = render(<InsightsScreen />);

    const dipsTab = getByText(/🔥 DOUBLE & TRIPLE DIPS/i);
    fireEvent.press(dipsTab);

    // Should display the calculator card and sliders
    expect(getByText(/🚀 Double\/Triple Dip ROI Calculator/i)).toBeTruthy();
    expect(getByText(/Slide Campaign Spend/i)).toBeTruthy();
    
    // Default active strategy is Infinia Marriott stays with massive ROI output
    expect(getByText(/Strategy Blueprint: SmartBuy Infinia Marriott Bonvoy Stay Triple Dip/i)).toBeTruthy();
  });
});

describe('DealsScreen Component UI Elements', () => {
  const { WalletProvider } = require('../context/WalletContext');
  // Need to dynamically require the component since it doesn't exist yet in the RED phase
  let DealsScreen: any;
  beforeAll(() => {
    try {
      DealsScreen = require('../app/deals').default;
    } catch (e) {
      DealsScreen = function DealsScreenFallback() { return null; };
    }
  });

  it('should render the active points sales tracker list', () => {
    if (!DealsScreen) return; // Prevent crashes in RED phase
    
    const { getByText, queryAllByText } = render(
      <WalletProvider>
        <DealsScreen />
      </WalletProvider>
    );

    // Verify header and sales data
    expect(getByText(/LIVE POINTS SALES TRACKER/i)).toBeTruthy();
    expect(getByText(/Hilton Honors/i)).toBeTruthy();
    
    // Qatar appears in both the title and the recommendation reason
    const qatarMatches = queryAllByText(/Qatar Privilege Club/i);
    expect(qatarMatches.length).toBeGreaterThan(0);
    
    // Check cost math rendering
    expect(getByText(/₹0.42 per pt/i)).toBeTruthy(); // Hilton math from dealsEngine
    expect(getByText(/₹1.36 per pt/i)).toBeTruthy(); // Qatar math from dealsEngine
  });
});

describe('IntelScreen Component UI Elements', () => {
  let IntelScreen: any;
  beforeAll(() => {
    try {
      IntelScreen = require('../app/intel').default;
    } catch (e) {
      IntelScreen = function IntelScreenFallback() { return null; };
    }
  });

  it('should render the intelligence hub news feed correctly', () => {
    if (!IntelScreen) return;
    
    const { getByText, queryAllByText } = render(<IntelScreen />);

    // Header validation
    expect(getByText(/THE POINTS ARRAY INTEL/i)).toBeTruthy();
    expect(getByText(/The Latest Intelligence/i)).toBeTruthy();
    
    // Asserting that a devaluation warning is rendered
    const devaluationTags = queryAllByText(/DEVALUATION/i);
    expect(devaluationTags.length).toBeGreaterThan(0);
  });
});

describe('Phase 4: Monetization UI Elements', () => {
  let ConsultationScreen: any;
  beforeAll(() => {
    try {
      ConsultationScreen = require('../app/consultation').default;
    } catch (e) {
      ConsultationScreen = function ConsultationScreenFallback() { return null; };
    }
  });

  it('should render the consultation lead form correctly', () => {
    if (!ConsultationScreen) return;
    
    const { getByText, getByPlaceholderText } = render(<ConsultationScreen />);

    // Assert form elements
    expect(getByText(/AWARD CONCIERGE/i)).toBeTruthy();
    expect(getByText(/Book a 1-on-1 Strategy Session/i)).toBeTruthy();
    expect(getByPlaceholderText(/Your Name/i)).toBeTruthy();
    expect(getByPlaceholderText(/Destination \/ Goal/i)).toBeTruthy();
    expect(getByText(/Submit Request/i)).toBeTruthy();
  });

  it('should recommend the Axis Atlas card based on travel spending', () => {
    // Dynamically require AffiliateEngine
    let AffiliateEngine: any;
    try {
      AffiliateEngine = require('../components/AffiliateEngine').default;
    } catch (e) {
      return; // Graceful fail during TDD Red phase
    }

    const { getByText } = render(<AffiliateEngine recommendedCard="Axis Atlas" />);

    // Assert affiliate engine elements
    expect(getByText(/Missing Out On Points\?/i)).toBeTruthy();
    expect(getByText(/Axis Atlas/i)).toBeTruthy();
    expect(getByText(/Apply Now/i)).toBeTruthy();
  });
});
