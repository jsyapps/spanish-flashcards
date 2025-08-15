export const COLORS = {
  // Primary palette
  PRIMARY: '#007AFF', // iOS blue
  PRIMARY_LIGHT: '#E6F3FF',
  PRIMARY_DARK: '#0056CC',
  
  // Secondary warm palette
  SECONDARY: '#D69E2E', // Warm gold
  SECONDARY_LIGHT: '#FEF5E7',
  SECONDARY_DARK: '#B7791F',
  
  // Accent colors
  ACCENT: '#38B2AC', // Teal for highlights
  ACCENT_LIGHT: '#E6FFFA',
  
  // Status colors
  SUCCESS: '#38A169',
  SUCCESS_LIGHT: '#F0FFF4',
  DANGER: '#E53E3E',
  DANGER_LIGHT: '#FED7D7',
  WARNING: '#D69E2E',
  WARNING_LIGHT: '#FEF5E7',
  
  // Neutrals with better contrast
  WHITE: '#FFFFFF',
  BACKGROUND: '#F7FAFC',
  BACKGROUND_ELEVATED: '#FFFFFF',
  
  // Gray scale with better accessibility
  GRAY_50: '#F7FAFC',
  GRAY_100: '#EDF2F7',
  GRAY_200: '#E2E8F0',
  GRAY_300: '#CBD5E0',
  GRAY_400: '#A0AEC0',
  GRAY_500: '#718096',
  GRAY_600: '#4A5568',
  GRAY_700: '#2D3748',
  GRAY_800: '#1A202C',
  GRAY_900: '#171923',
  
  // Legacy support (gradually phase out)
  GRAY: '#718096',
  LIGHT_GRAY: '#E2E8F0',
  DARK_GRAY: '#2D3748',
  
  // UI specific colors
  INPUT_BACKGROUND: '#FFFFFF',
  INPUT_BORDER: '#E2E8F0',
  INPUT_BORDER_FOCUS: '#007AFF',
  BORDER: '#E2E8F0',
  LOADING_BACKGROUND: '#F7FAFC',
  EMPTY_ICON: '#CBD5E0',
  LIGHT_BLUE: '#EBF8FF',
  DISABLED: '#CBD5E0',
  DISABLED_BACKGROUND: '#F7FAFC',
  
  // Card specific
  CARD_BACKGROUND: '#FFFFFF',
  CARD_BORDER: '#BEE3F8', // Light blue to match index card lines
  CARD_HEADER_BORDER: '#F56565', // Reddish pink to match index card header line
  CARD_SHADOW: 'rgba(0, 0, 0, 0.1)',
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  XXXL: 30,
  XXXXL: 40,
};

export const BORDER_RADIUS = {
  SM: 6,
  MD: 8,
  LG: 12,
  XL: 15,
  XXL: 20,
};

export const FONT_SIZE = {
  XS: 10,
  SM: 12,
  MD: 14,
  LG: 16,
  XL: 18,
  XXL: 20,
  XXXL: 24,
  XXXXL: 28,
  XXXXXL: 32,
  TITLE: 36,
};

export const FONT_WEIGHT = {
  LIGHT: '300' as const,
  REGULAR: '400' as const,
  MEDIUM: '500' as const,
  SEMIBOLD: '600' as const,
  BOLD: '700' as const,
  EXTRABOLD: '800' as const,
};

// Enhanced shadow system for depth
export const SHADOW = {
  NONE: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  SM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  MD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  LG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  XL: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Legacy support
export const CARD_SHADOW = SHADOW.LG;