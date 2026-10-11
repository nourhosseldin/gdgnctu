/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Cairo', 'system-ui', 'sans-serif'],
      },
      colors: {
        gdg: {
          blue: '#4285F4',
          red: '#EA4335',
          yellow: '#FBBC05',
          green: '#34A853',
          dark: '#202124',
          gray: '#5F6368',
          light: '#F8F9FA'
        },
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 4px 24px -8px rgba(15, 23, 42, 0.12)',
        'card': '0 1px 2px rgba(15,23,42,.04), 0 10px 40px -16px rgba(15,23,42,.16)',
        'glow': '0 12px 40px -12px rgba(79,70,229,.55)',
        'glow-emerald': '0 12px 40px -12px rgba(16,185,129,.5)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        blob: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-40px) scale(1.08)' },
          '66%': { transform: 'translate(-24px,20px) scale(.94)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(-100%)' },
        },
        growBar: {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        progress: {
          '0%': { width: '0%' },
        },
      },
      animation: {
        fadeIn: 'fadeIn .5s ease both',
        fadeInUp: 'fadeInUp .6s cubic-bezier(.22,1,.36,1) both',
        scaleIn: 'scaleIn .4s cubic-bezier(.22,1,.36,1) both',
        floaty: 'floaty 6s ease-in-out infinite',
        blob: 'blob 16s ease-in-out infinite',
        shimmer: 'shimmer 2.5s infinite',
        growBar: 'growBar .9s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
}
