export type ThemeMode = 'light' | 'dark';

export const fontFamilies = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
};

export const createTheme = (mode: ThemeMode) => {
  const isDark = mode === 'dark';

  return {
    mode,
    colors: {
      background: isDark ? '#07130D' : '#F4FFF7',
      card: isDark ? '#102018' : '#FFFFFF',
      cardAlt: isDark ? '#163123' : '#EEFFF3',
      primary: '#2E9F5A',
      primaryDeep: '#1F7B42',
      primarySoft: isDark ? 'rgba(46, 159, 90, 0.18)' : '#DFF8E7',
      border: isDark ? '#1F3B2C' : '#D8F0DE',
      text: isDark ? '#F3FFF6' : '#102116',
      textMuted: isDark ? '#97B4A1' : '#5C7665',
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
      tabBar: isDark ? '#0D1A13' : '#FCFFFD',
      shadow: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(20, 72, 41, 0.08)',
    },
    spacing: {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    radius: {
      sm: 14,
      md: 20,
      lg: 28,
      full: 999,
    },
  };
};

export type AppTheme = ReturnType<typeof createTheme>;

