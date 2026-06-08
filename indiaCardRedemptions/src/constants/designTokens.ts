import { Platform } from 'react-native';

export const Colors = {
  obsidian: '#050508',
  champagne: '#F5F2EB',
  accentGold: '#D4AF37',
  cardDark: '#121318',
  cardSelected: '#1C1D24',
  slateGrey: '#8A8E9A',
} as const;

export const Fonts = {
  sans: Platform.select({
    ios: 'Outfit-Regular',
    android: 'Outfit-Regular',
    web: 'Outfit, sans-serif',
    default: 'Outfit-Regular',
  }) || 'System',
  serif: Platform.select({
    ios: 'Cinzel-Regular',
    android: 'Cinzel-Regular',
    web: 'Cinzel, serif',
    default: 'Cinzel-Regular',
  }) || 'Georgia',
  sansBold: Platform.select({
    ios: 'Outfit-Bold',
    android: 'Outfit-Bold',
    web: 'Outfit-Bold, sans-serif',
    default: 'Outfit-Bold',
  }) || 'System',
  serifBold: Platform.select({
    ios: 'Cinzel-Bold',
    android: 'Cinzel-Bold',
    web: 'Cinzel-Bold, serif',
    default: 'Cinzel-Bold',
  }) || 'Georgia',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BorderWidths = {
  thin: 1,
  accent: 1.5,
  thick: 2,
};

export const BorderColors = {
  goldOutline: 'rgba(212, 175, 55, 0.15)',
  subtleOutline: 'rgba(245, 242, 235, 0.08)',
};

export const Opacities = {
  glass: 0.85,
  subtle: 0.15,
};
