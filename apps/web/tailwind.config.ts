import type { Config } from 'tailwindcss';

const config: Config = {
  // ── Content Paths ──────────────────────────────────────────────────────────
  // Tell Tailwind which files to scan for class names.
  // This is how Tailwind purges unused CSS in production.
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './providers/**/*.{ts,tsx}',
  ],

  // ── Theme ──────────────────────────────────────────────────────────────────
  theme: {
    extend: {
      // ── Font Family ─────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ── Brand Colors ────────────────────────────────────────────────────
      colors: {
        // Dark background palette
        surface: {
          DEFAULT: '#0f0f11',  // Page background
          1:       '#18181b',  // Card background
          2:       '#27272a',  // Input / secondary surface
          3:       '#3f3f46',  // Border / divider
        },
        // Primary accent — indigo
        primary: {
          DEFAULT: '#6366f1',
          hover:   '#4f46e5',
          light:   '#818cf8',
          subtle:  '#1e1b4b',
        },
        // Semantic text
        text: {
          DEFAULT:  '#e5e5ea',  // Primary text
          secondary:'#a1a1aa',  // Muted text
          disabled: '#52525b',  // Disabled / placeholder
        },
        // Status colors
        status: {
          open:        '#6366f1',  // indigo
          in_progress: '#f59e0b',  // amber
          resolved:    '#22c55e',  // green
        },
        // Severity colors
        severity: {
          low:      '#3b82f6',  // blue
          medium:   '#f59e0b',  // amber
          high:     '#f97316',  // orange
          critical: '#ef4444',  // red
        },
      },

      // ── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        DEFAULT: '8px',
        sm:      '4px',
        lg:      '12px',
        xl:      '16px',
        '2xl':   '20px',
      },

      // ── Box Shadow ──────────────────────────────────────────────────────
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        modal: '0 20px 60px rgba(0,0,0,0.6)',
        glow:  '0 0 20px rgba(99,102,241,0.3)',
      },

      // ── Animation ───────────────────────────────────────────────────────
      animation: {
        'fade-in':     'fadeIn 0.2s ease-out',
        'slide-up':    'slideUp 0.25s ease-out',
        'spin-slow':   'spin 1.5s linear infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(99,102,241,0.2)' },
          '50%':      { boxShadow: '0 0 20px rgba(99,102,241,0.5)' },
        },
      },

      // ── Screens ─────────────────────────────────────────────────────────
      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },

  // ── Plugins ────────────────────────────────────────────────────────────────
  plugins: [],
};

export default config;
