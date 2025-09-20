// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Britannia Brewing Brand Colors
        'britannia': {
          'navy': '#1a2332',
          'gold': '#d4af37',
          'copper': '#b87333',
          'cream': '#f5f2e8',
          'dark-gray': '#2c3e50',
          'light-gray': '#ecf0f1',
        }
      },
      fontFamily: {
        'display': ['Bebas Neue', 'sans-serif'],
        'body': ['Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/images/brewery-bg.jpg')",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
