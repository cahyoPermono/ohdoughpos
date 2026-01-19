/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
      },
      colors: {
        earth: {
          50: '#FDFCFA',
          100: '#F7F3EE',
          200: '#E8E0D5',
          300: '#D5C4B0',
          400: '#B5977A',
          500: '#8B6F4F',
          600: '#6D5739',
          700: '#5A4730',
          800: '#3D2F20',
          900: '#2A1F15',
          950: '#1A140D',
        },
        accent: {
          gold: '#D4A574',
          copper: '#C78B5E',
          cream: '#FFF8F0',
          warm: '#FFECD9',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-warm': 'linear-gradient(135deg, #FFF8F0 0%, #FFECD9 100%)',
        'gradient-card': 'linear-gradient(180deg, #FFFFFF 0%, #FDFCFA 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #3D2F20 0%, #2A1F15 100%)',
        'gradient-button': 'linear-gradient(135deg, #5A4730 0%, #3D2F20 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4A574 0%, #C78B5E 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(61, 47, 32, 0.05), 0 6px 16px rgba(61, 47, 32, 0.06)',
        'card-hover': '0 4px 12px rgba(61, 47, 32, 0.08), 0 16px 32px rgba(61, 47, 32, 0.1)',
        'sidebar': '4px 0 24px rgba(42, 31, 21, 0.15)',
        'button': '0 4px 14px rgba(90, 71, 48, 0.3)',
        'button-hover': '0 6px 20px rgba(90, 71, 48, 0.4)',
        'glow': '0 0 20px rgba(212, 165, 116, 0.3)',
        'inner-light': 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
