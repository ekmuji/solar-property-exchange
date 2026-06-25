import type { Config } from 'tailwindcss';

// Design tokens — see DESIGN.md for the rationale. Subject: a control-room
// for an energy asset. Base is industrial graphite, not pure black; amber
// stands for solar, teal stands for grid electricity, terracotta stands for
// time-pressure (auctions). Data is always set in monospace, like a meter.
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#15171A',
        surface: '#1C1F23',
        surface2: '#242830',
        border: '#34383E',
        ink: '#F2F0EA',
        'ink-muted': '#9CA3AB',
        solar: {
          DEFAULT: '#F2A93B',
          dim: '#8A6324',
          50: '#FCEDD2',
        },
        grid: {
          DEFAULT: '#3FBFAE',
          dim: '#1F5C53',
          50: '#D6F2EE',
        },
        auction: {
          DEFAULT: '#E2574C',
          dim: '#7A2A23',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.5)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
