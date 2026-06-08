import '@/global.css';

import { Platform } from 'react-native';
import { Colors as TokensColors, Fonts as TokensFonts, Spacing as TokensSpacing } from './designTokens';

export const Colors = {
  light: {
    text: TokensColors.champagne,
    background: TokensColors.obsidian,
    backgroundElement: TokensColors.cardDark,
    backgroundSelected: TokensColors.cardSelected,
    textSecondary: TokensColors.slateGrey,
    gold: TokensColors.accentGold,
  },
  dark: {
    text: TokensColors.champagne,
    background: TokensColors.obsidian,
    backgroundElement: TokensColors.cardDark,
    backgroundSelected: TokensColors.cardSelected,
    textSecondary: TokensColors.slateGrey,
    gold: TokensColors.accentGold,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  sans: TokensFonts.sans,
  serif: TokensFonts.serif,
  rounded: TokensFonts.sans,
  mono: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    web: 'var(--font-mono)',
    default: 'monospace',
  }) || 'monospace',
};

export const Spacing = TokensSpacing;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = Platform.OS === 'web' ? 1200 : 800;
