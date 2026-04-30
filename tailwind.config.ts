import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        surface: '#0a0a0a',
        raised: '#141414',
        accent: '#f5d24a',
        'accent-hover': '#ffe066',
        live: '#ff3838',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.48)',
        secondary: 'rgba(255,255,255,0.78)',
        subtle: 'rgba(255,255,255,0.18)',
        hairline: 'rgba(255,255,255,0.10)',
        success: '#39d353',
        danger: '#ff3838',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        label: ['11px', { lineHeight: '14px', letterSpacing: '0.16em' }],
      },
      borderRadius: {
        DEFAULT: '0',
        sm: '2px',
        md: '4px',
        lg: '6px',
      },
      animation: {
        blink: 'blink 1.2s step-end infinite',
      },
      keyframes: {
        blink: { '0%, 50%': { opacity: '1' }, '50.01%, 100%': { opacity: '0' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
