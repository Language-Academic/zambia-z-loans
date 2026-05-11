/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Enable class-based dark mode for better control
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // We map these to CSS variables defined in your index.css
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          DEFAULT: 'var(--color-primary-600)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary-500)',
          // logic continues for other shades...
        },
        surface: {
          main: 'var(--color-bg-main)',
          card: 'var(--color-bg-card)',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [
    // Adds professional form styling (essential for loan apps)
    require('@tailwindcss/forms'),
    // Adds useful typography utilities for terms & conditions
    require('@tailwindcss/typography'),
  ],
}
