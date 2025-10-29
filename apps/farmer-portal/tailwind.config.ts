import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // GACP Brand Colors
        primary: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50', // Main green
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20'
        },
        secondary: {
          50: '#fff3e0',
          100: '#ffe0b2',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa726',
          500: '#ff9800', // Main orange
          600: '#fb8c00',
          700: '#f57c00',
          800: '#ef6c00',
          900: '#e65100'
        },
        success: {
          light: '#81c784',
          main: '#4caf50',
          dark: '#388e3c'
        },
        warning: {
          light: '#ffb74d',
          main: '#ff9800',
          dark: '#f57c00'
        },
        error: {
          light: '#e57373',
          main: '#f44336',
          dark: '#d32f2f'
        },
        info: {
          light: '#64b5f6',
          main: '#2196f3',
          dark: '#1976d2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'sans-serif'],
        thai: ['Noto Sans Thai', 'sans-serif']
      },
      boxShadow: {
        'md-hover': '0 6px 20px 0 rgba(0, 0, 0, 0.15)'
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false // Disable Tailwind's base reset to work with MUI
  }
};

export default config;
