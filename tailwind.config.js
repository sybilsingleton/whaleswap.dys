module.exports = {
  daisyui: {
    themes: [
      {
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
        },
        light: {
          ...require('daisyui/src/theming/themes')['[data-theme=light]'],
        },
      },
    ],
  },
  content: ['./src/**/*.{vue,js,ts}'],
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}
