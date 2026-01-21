/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // zinc-950
        surface: '#18181b', // zinc-900
        surfaceHighlight: '#27272a', // zinc-800
        border: '#27272a', // zinc-800
        primary: '#6366f1', // indigo-500
        primaryHover: '#4f46e5', // indigo-600
        secondary: '#a1a1aa', // zinc-400
        text: '#f4f4f5', // zinc-100
        muted: '#71717a', // zinc-500
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}