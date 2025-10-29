/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'brand-lg': '0 25px 50px -12px rgba(79, 70, 229, 0.35)'
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at top, rgba(79, 70, 229, 0.35), transparent 60%)'
      }
    }
  },
  plugins: []
};
