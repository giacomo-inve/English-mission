/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--color-bg-primary, #000000)',
        'bg-section': 'var(--color-bg-section, #0a0a0a)',
        'text-display': 'var(--color-text-display, #ffffff)',
        'text-content': 'var(--color-text-content, #f0f0fa)',
        'text-secondary': 'var(--color-text-secondary, #8a8a93)',
        'border-subtle': 'var(--color-border-subtle, #3a3a3f)',
        'signal-ok': '#3DDC84',
        'signal-err': '#FF5C5C',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', '"SF Pro Display"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'display': '0.15em',
        'wide-xl': '0.25em',
      },
      borderRadius: {
        'pill': '32px',
      },
    },
  },
  plugins: [],
}
