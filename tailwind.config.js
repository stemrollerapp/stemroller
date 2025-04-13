import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./renderer-src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mukta', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
