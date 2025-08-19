export const COLORS = {
  primary: '#FFFFFF',
  secondary: '#003566',
  success: '#0FB465',
  danger: '#DC2626',
  info: '#2563EB',
  warning: '#CA8A04',
  warningBackground: '#FEFCE8',
  
  correct: '#0FB465',
  incorrect: '#DC2626',
  
  white: '#FFFFFF',
  background: '#F8F9FA',
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  
  green: '#27AE60',
  greenBackground: '#E6F4EA',
  greenText: '#1E8449',
  yellow: '#F2C94C',
  red: '#FADBD8',
  redText: '#C0392B',
  
  secondaryGradient: {
    start: '#003566',
    end: '#004080',
  },
} as const;

export type ColorKey = keyof typeof COLORS;