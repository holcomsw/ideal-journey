import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#07080d',
          card: '#0d1117',
          elevated: '#131720',
        },
        brand: {
          blue: '#3b82f6',
          green: '#22c55e',
          blueDim: 'rgba(59,130,246,0.12)',
          greenDim: 'rgba(34,197,94,0.12)',
          blueGlow: 'rgba(59,130,246,0.25)',
          greenGlow: 'rgba(34,197,94,0.25)',
        },
        border: {
          DEFAULT: '#1e2433',
          glow: 'rgba(59,130,246,0.2)',
        },
        text: {
          primary: '#e2e8f0',
          muted: '#64748b',
          faint: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'carbon': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='2' height='2' fill='%23ffffff08'/%3E%3Crect x='2' y='2' width='2' height='2' fill='%23ffffff08'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'counter': 'counter 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(59,130,246,0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(59,130,246,0.5)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59,130,246,0.15), 0 0 40px rgba(59,130,246,0.05)',
        'glow-green': '0 0 20px rgba(34,197,94,0.15), 0 0 40px rgba(34,197,94,0.05)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}

export default config
