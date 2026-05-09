import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#012152',
        'navy-2': '#021a3d',
        ink: '#0a1124',
        paper: '#ffffff',
        'paper-2': '#f6f5f0',
        lime: '#D1E231',
        green: '#0A9830',
        'green-2': '#0c7a28',
      },
      fontFamily: {
        geist: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        hind: ['var(--font-hind)', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'none' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.8s ease both',
        marquee: 'marquee 40s linear infinite',
        float: 'float 4s ease-in-out infinite',
        spin: 'spin 18s linear infinite',
        pulse: 'pulse 2s ease-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
