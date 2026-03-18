/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef6ff',
          100: '#d8eaff',
          200: '#b9d9ff',
          300: '#88bfff',
          400: '#4f9aff',
          500: '#2878ff',
          600: '#1258f5',
          700: '#0b43e1',
          800: '#1037b6',
          900: '#12348f',
          950: '#0d2060',
        },
        sidebar: {
          bg:     '#0f172a',
          hover:  '#1e293b',
          active: '#2878ff',
          text:   '#94a3b8',
          textActive: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / .07), 0 1px 2px -1px rgb(0 0 0 / .07)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / .10)',
      },
    },
  },
  plugins: [],
}
