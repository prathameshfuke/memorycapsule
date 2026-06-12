import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A1A1A',
        paper: '#FFF8F2',
        red: '#E8262A',
        'red-deep': '#B01E22',
        blush: '#FFD9D4',
        charcoal: '#4A4543',
        gold: '#E8B84B',
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
