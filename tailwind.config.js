/** @type {import('tailwindcss').Config} */
export default {
  // ============================================
  // CONTENT — Onde procurar classes Tailwind
  // ============================================
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{css,scss}",
  ],

  darkMode: 'class',

  theme: {
    extend: {
      // ============================================
      // TIPOGRAFIA — Plus Jakarta Sans
      // ============================================
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      // ============================================
      // ESCALA TIPOGRÁFICA
      // ============================================
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'xs':  ['0.75rem',  { lineHeight: '1.125rem' }],
        'sm':  ['0.875rem', { lineHeight: '1.375rem' }],
        'base': ['1rem',    { lineHeight: '1.625rem' }],
        'lg':  ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':  ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.75rem' }],
        '5xl': ['3rem',     { lineHeight: '3.5rem' }],
        '6xl': ['3.75rem',  { lineHeight: '4.25rem' }],
        '7xl': ['4.5rem',   { lineHeight: '5rem' }],
        '8xl': ['6rem',     { lineHeight: '6.25rem' }],
        '9xl': ['8rem',     { lineHeight: '8.25rem' }],
      },

      // ============================================
      // LETTER SPACING
      // ============================================
      letterSpacing: {
        'tighter': '-0.025em',
        'tight': '-0.015em',
        'normal': '0',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
        'ultra-wide': '0.15em',
        'mega-wide': '0.25em',
      },

      // ============================================
      // 🎨 CORES — IDENTIDADE RADAR RAAVTUR
      // ============================================
      colors: {
        // 🏜️ TERRA — Terracota (cor principal)
        terra: {
          50:  '#FBF3EF',
          100: '#F4DED4',
          200: '#E8BCA6',
          300: '#D89472',
          400: '#C26B44',
          500: '#A94B28',
          600: '#8D3B1F',
          700: '#702E18',
          800: '#542211',
          900: '#3A170B',
          DEFAULT: '#A94B28',
        },

        // 🌿 VEGETAÇÃO — Verde profundo (secundária)
        vegetacao: {
          50:  '#EFF5F2',
          100: '#D5E5DE',
          200: '#A9CBBE',
          300: '#78AD9A',
          400: '#488A72',
          500: '#1F5A47',
          600: '#174A3A',
          700: '#0F382C',
          800: '#0A261E',
          900: '#051310',
          DEFAULT: '#1F5A47',
        },

        // 🌊 OCEANO — Azul-petróleo
        oceano: {
          50:  '#EEF4F6',
          100: '#D3E4E9',
          200: '#A6C8D3',
          300: '#71A4B5',
          400: '#4780A0',
          500: '#2B5D7A',
          600: '#234A61',
          700: '#1B3849',
          800: '#142733',
          900: '#0B161D',
          DEFAULT: '#2B5D7A',
        },

        // 🏖️ AREIA — Neutro quente
        areia: {
          50:  '#FBF9F5',
          100: '#F7F4EC',
          200: '#EDE7D9',
          300: '#DDD4C0',
          400: '#C8BCA2',
          500: '#AB9C7F',
          600: '#897C60',
          700: '#685D48',
          800: '#4A4233',
          900: '#2E2A21',
          DEFAULT: '#F7F4EC',
        },

        // 🪨 PEDRA — Neutro frio
        pedra: {
          50:  '#F4F5F4',
          100: '#E8EAE9',
          200: '#D3D7D5',
          300: '#B3BAB6',
          400: '#8E9792',
          500: '#6B7570',
          600: '#545E59',
          700: '#3D453F',
          800: '#282E2B',
          900: '#18211D',
          DEFAULT: '#6B7570',
        },

        // 🌅 SOL — Dourado quente
        sol: {
          50:  '#FEF9EC',
          100: '#FBEEC9',
          200: '#F5DB92',
          300: '#EBC45A',
          400: '#D9A929',
          500: '#B88A1A',
          600: '#947014',
          700: '#6F540F',
          800: '#4B3A0B',
          900: '#2D2307',
          DEFAULT: '#D9A929',
        },

        // 🔵 AZUL — Cor de acento principal (identidade atual)
        azul: {
          50:  '#F0F7FE',
          100: '#DBEEFB',
          200: '#B8DDF8',
          300: '#7FC0FA',   // ← cor de acento atual
          400: '#4FA8F0',
          500: '#2E8FE0',
          600: '#1F73BE',
          700: '#1A5A96',
          800: '#194A78',
          900: '#163D62',
          DEFAULT: '#7FC0FA',
        },

        // 🔁 ALIASES — Compatibilidade
        primary: {
          50:  '#FBF3EF',
          100: '#F4DED4',
          200: '#E8BCA6',
          300: '#D89472',
          400: '#C26B44',
          500: '#A94B28',
          600: '#8D3B1F',
          700: '#702E18',
          800: '#542211',
          900: '#3A170B',
          DEFAULT: '#A94B28',
        },

        accent: {
          50:  '#F0F7FE',
          100: '#DBEEFB',
          200: '#B8DDF8',
          300: '#7FC0FA',
          400: '#4FA8F0',
          500: '#2E8FE0',
          600: '#1F73BE',
          700: '#1A5A96',
          800: '#194A78',
          900: '#163D62',
          DEFAULT: '#7FC0FA',
        },

        // 🎨 Marca
        ravtur: {
          red:      '#A94B28',
          gold:     '#D9A929',
          green:    '#1F5A47',
          blue:     '#7FC0FA',
          darkGreen:'#174A3A',
        },
      },

      // ============================================
      // SOMBRAS — Profissionais
      // ============================================
      boxShadow: {
        // Sombras neutras
        'rv-xs': '0 1px 2px rgba(24, 33, 29, 0.04)',
        'rv-sm': '0 1px 3px rgba(24, 33, 29, 0.06), 0 1px 2px rgba(24, 33, 29, 0.04)',
        'rv-md': '0 4px 12px rgba(24, 33, 29, 0.06), 0 2px 4px rgba(24, 33, 29, 0.04)',
        'rv-lg': '0 12px 24px rgba(24, 33, 29, 0.08), 0 4px 8px rgba(24, 33, 29, 0.04)',
        'rv-xl': '0 24px 48px rgba(24, 33, 29, 0.12)',
        'soft':  '0 2px 12px -2px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 40px -10px rgba(24, 33, 29, 0.15)',

        // Sombras coloridas (glow)
        'glow-blue': '0 0 24px -4px rgba(127, 192, 250, 0.45)',
        'glow-gold': '0 0 24px -4px rgba(217, 169, 41, 0.35)',
        'glow-red':  '0 0 24px -4px rgba(169, 75, 40, 0.35)',
        'glow-green':'0 0 24px -4px rgba(31, 90, 71, 0.35)',

        // Sombras de botão (raised)
        'btn':       '0 2px 4px rgba(24, 33, 29, 0.08), 0 1px 2px rgba(24, 33, 29, 0.06)',
        'btn-hover': '0 4px 12px rgba(24, 33, 29, 0.12), 0 2px 4px rgba(24, 33, 29, 0.06)',
        'btn-active':'0 1px 2px rgba(24, 33, 29, 0.08), inset 0 1px 2px rgba(0, 0, 0, 0.05)',
      },

      // ============================================
      // BORDER RADIUS
      // ============================================
      borderRadius: {
        'rv-sm': '6px',
        'rv-md': '10px',
        'rv-lg': '14px',
        'rv-xl': '20px',
        'rv-2xl': '24px',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ============================================
      // BACKDROP BLUR
      // ============================================
      backdropBlur: {
        'xs': '2px',
        'rv-sm': '8px',
        'rv-md': '12px',
        'rv-lg': '20px',
      },

      // ============================================
      // ANIMAÇÕES — Completas
      // ============================================
      animation: {
        // Entradas
        'fade-in':        'fadeIn 0.4s ease-out',
        'fade-in-fast':   'fadeIn 0.2s ease-out',
        'fade-in-slow':   'fadeIn 0.8s ease-out',
        'slide-up':       'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down':     'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left':  'slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':       'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',

        // Loop
        'bounce-soft':    'bounceSoft 1.2s ease-in-out infinite',
        'pulse-soft':     'pulseSoft 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'float':          'float 3s ease-in-out infinite',

        // Especiais
        'drawer-in':      'slideInLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        'backdrop-in':    'fadeIn 0.2s ease-out',
        'modal-in':       'modalIn 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        'dropdown-in':    'dropdownIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow':      'spin 3s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        modalIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        dropdownIn: {
          '0%':   { opacity: '0', transform: 'translateY(-8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },

      // ============================================
      // TRANSIÇÕES
      // ============================================
      transitionTimingFunction: {
        'rv-out':   'cubic-bezier(0.16, 1, 0.3, 1)',
        'rv-in':    'cubic-bezier(0.7, 0, 0.84, 0)',
        'rv-inout': 'cubic-bezier(0.83, 0, 0.17, 1)',
      },

      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '450': '450ms',
        '600': '600ms',
        '800': '800ms',
      },

      // ============================================
      // Z-INDEX organizado
      // ============================================
      zIndex: {
        'nav':       '40',
        'topbar':    '50',
        'backdrop':  '60',
        'drawer':    '70',
        'modal':     '80',
        'popover':   '90',
        'toast':     '100',
        'tooltip':   '110',
      },

      // ============================================
      // SPACING (adicionais)
      // ============================================
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '17':  '4.25rem',
        '18':  '4.5rem',
        '19':  '4.75rem',
        '21':  '5.25rem',
        '22':  '5.5rem',
        '68':  '17rem',
        '72':  '18rem',
        '76':  '19rem',
        '80':  '20rem',
        '88':  '22rem',
        '96':  '24rem',
        '104': '26rem',
        '112': '28rem',
        '120': '30rem',
      },

      // ============================================
      // MAX-WIDTH (adicionais)
      // ============================================
      maxWidth: {
        '8xl':  '88rem',
        '9xl':  '96rem',
        'screen-2xl': '1536px',
        'drawer': '20rem',
      },

      // ============================================
      // HEIGHT (adicionais)
      // ============================================
      height: {
        'topbar':       '4rem',    // 64px
        'topbar-lg':    '4.5rem',  // 72px
        'bottomnav':    '4.5rem',  // 72px
        'screen-90':    '90vh',
        'screen-92':    '92vh',
      },

      // ============================================
      // BACKGROUND IMAGE (padrões + gradientes)
      // ============================================
      backgroundImage: {
        // Gradientes da marca
        'gradient-rv-primary': 'linear-gradient(135deg, #A94B28 0%, #8D3B1F 100%)',
        'gradient-rv-accent':  'linear-gradient(135deg, #7FC0FA 0%, #4FA8F0 100%)',
        'gradient-rv-hero':    'linear-gradient(135deg, #174A3A 0%, #0F382C 50%, #0D1410 100%)',
        'gradient-rv-gold':    'linear-gradient(135deg, #D9A929 0%, #B88A1A 100%)',

        // Gradientes suaves (para overlays)
        'gradient-top':    'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
        'gradient-bottom': 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        'gradient-right':  'linear-gradient(to left, rgba(0,0,0,0.8), transparent)',

        // Shimmer (skeleton loading)
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
      },

      // ============================================
      // ASPECT RATIO (para cards de destino)
      // ============================================
      aspectRatio: {
        'destination': '4 / 5',
        'hotel':       '16 / 10',
        'banner':      '16 / 6',
        'og':          '1200 / 630',
      },
    },
  },

  // ============================================
  // PLUGINS
  // ============================================
  plugins: [
    // Descomenta se instalares os plugins:
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
    // require('@tailwindcss/container-queries'),
  ],
}