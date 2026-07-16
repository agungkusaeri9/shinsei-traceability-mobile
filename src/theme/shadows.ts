import { ViewStyle } from 'react-native';

// ─── Shadow Elevations ────────────────────────────────────────────────────────

export const shadows: Record<'sm' | 'md', ViewStyle> = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};
