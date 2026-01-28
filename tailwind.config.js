/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'papaya-green': '#2E7D32',
        'papaya-yellow': '#FFD600',
        'papaya-light': '#F5F5F5',
      },
      backgroundImage: {
        'hero-pattern': "url('/images/hero-bg.svg')",
      },
    },
  },
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
