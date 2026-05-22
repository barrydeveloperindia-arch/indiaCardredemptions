import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CardState {
  cardId: string;
  balance: number;
  spend: number;
}

interface WalletContextType {
  cards: CardState[];
  updateBalance: (cardId: string, balance: number) => void;
  updateSpend: (cardId: string, spend: number) => void;
  walletBalances: { [cardId: string]: number };
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Initial state with May 2026 User Balances from credit card reference file
const INITIAL_CARDS: CardState[] = [
  { cardId: 'axis_m4b', balance: 56000, spend: 400000 },
  { cardId: 'amex_platinum', balance: 120000, spend: 350000 },
  { cardId: 'hsbc_premier', balance: 75000, spend: 180000 },
  { cardId: 'yes_private', balance: 40000, spend: 0 },
];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CardState[]>(INITIAL_CARDS);

  const updateBalance = (cardId: string, balance: number) => {
    setCards((prev) =>
      prev.map((c) => (c.cardId === cardId ? { ...c, balance } : c))
    );
  };

  const updateSpend = (cardId: string, spend: number) => {
    setCards((prev) =>
      prev.map((c) => (c.cardId === cardId ? { ...c, spend } : c))
    );
  };

  // Convert array to a keyed dictionary for our calculation engines
  const walletBalances = cards.reduce((acc, c) => {
    acc[c.cardId] = c.balance;
    return acc;
  }, {} as { [cardId: string]: number });

  return (
    <WalletContext.Provider value={{ cards, updateBalance, updateSpend, walletBalances }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
