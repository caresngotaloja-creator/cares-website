/** Colours taken from the C.A.R.E.S. logo */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1B2AA8', dark: '#121C78', soft: '#E8EBFB' },
        leaf: { DEFAULT: '#0F6B26', dark: '#0A4D1B', soft: '#E6F3EA' },
        sky: { brand: '#1E90E0' },
        ink: '#1B1F3B',
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
