/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0c0e14',
          panel: '#131722',
          card: '#1a202c',
          hover: '#222938',
          border: '#2a3447',
          'border-subtle': '#1e2635',
        },
        dark: {
          950: '#0c0e14',
          900: '#131722',
          850: '#1a202c',
          800: '#222938',
          700: '#2d3748',
          600: '#3f4d67',
        },
        accent: {
          studio: '#f59e0b',
          'studio-hover': '#d97706',
          'studio-subtle': 'rgba(245, 158, 11, 0.12)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'studio-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.35)',
        'studio-md': '0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -2px rgba(0, 0, 0, 0.25)',
        'studio-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.45), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
