const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./renderer-src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Mukta', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
