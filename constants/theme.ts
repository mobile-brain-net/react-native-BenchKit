export const COLORS = {
  background: '#FFFFFF',
  surface: '#F0F0F0',
  text: '#333333',
  textSecondary: '#888888',
  primary: '#00BCD4',
  accent: '#FFD700',
  border: '#CCCCCC',
  success: '#00BCD4',
  warning: '#FFD700',
  error: '#FF3333',
  shadow: '#666666',
  waveYellow: 'rgba(255, 255, 200, 0.3)',
  waveBlue: 'rgba(200, 230, 255, 0.3)',
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'Oswald-Regular',
    medium: 'Oswald-Medium',
    bold: 'Oswald-Bold',
    mono: 'SpaceMono-Regular',
    monoBold: 'SpaceMono-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 12,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const SHADOWS = {
  brutal: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  brutalLarge: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 6,
      height: 6,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
} as const;
