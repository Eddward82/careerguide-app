// Light Theme (Default)
export const Colors = {
  primary: '#4A90E2', // Professional Sky Blue
  success: '#7ED8B4', // Soft Mint Green
  background: '#F8F9FA', // Off-White Background
  navy: '#1A2332', // Deep Navy
  white: '#FFFFFF',
  lightGray: '#E5E8EB',
  mediumGray: '#9BA3AF',
  cardBackground: '#FFFFFF',
  shadow: '#000000',
  error: '#E74C3C',
  warning: '#FFA726',
  info: '#29B6F6',
};

// Dark Theme
export const DarkColors = {
  primary: '#4A90E2', // Professional Sky Blue (same)
  success: '#7ED8B4', // Soft Mint Green (same)
  background: '#121820', // Dark Background
  navy: '#FFFFFF', // White text for dark mode
  white: '#1A2332', // Dark cards
  lightGray: '#2A3442',
  mediumGray: '#9BA3AF',
  cardBackground: '#1E2936',
  shadow: '#000000',
  error: '#E74C3C',
  warning: '#FFA726',
  info: '#29B6F6',
};

// Helper function to get theme colors
export const getThemeColors = (isDark: boolean) => (isDark ? DarkColors : Colors);

export const motivationalQuotes = [
  {
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
  },
  {
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
  },
  {
    text: 'The future depends on what you do today.',
    author: 'Mahatma Gandhi',
  },
  {
    text: 'Don\'t watch the clock; do what it does. Keep going.',
    author: 'Sam Levenson',
  },
  {
    text: 'Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.',
    author: 'Steve Jobs',
  },
  {
    text: 'The only impossible journey is the one you never begin.',
    author: 'Tony Robbins',
  },
  {
    text: 'Success usually comes to those who are too busy to be looking for it.',
    author: 'Henry David Thoreau',
  },
  {
    text: 'Opportunities don\'t happen. You create them.',
    author: 'Chris Grosser',
  },
];
