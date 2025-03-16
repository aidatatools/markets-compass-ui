import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#333',
            lineHeight: '1.6',
            p: {
              marginBottom: '1.5em',
            },
            'h1, h2, h3': {
              fontWeight: '700',
              marginTop: '2em',
              marginBottom: '1em',
            },
            h1: {
              fontSize: '2.25em',
            },
            h2: {
              fontSize: '1.875em',
            },
            h3: {
              fontSize: '1.5em',
            },
            'ul, ol': {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
            },
            li: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            strong: {
              fontWeight: '700',
              color: '#2563eb', // blue-600
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
};

export default config; 