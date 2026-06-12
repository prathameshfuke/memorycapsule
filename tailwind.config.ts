import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C1410',
        paper: '#F7EFE6',
        cream: '#FBF6EF',
        crimson: '#C3232B',
        ember: '#8C4A3A',
        dust: '#9C8A7C',
        gold: '#C9A45C',
        red: '#C3232B',
        'red-deep': '#8C4A3A',
        blush: '#C9A45C',
        charcoal: '#9C8A7C',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
