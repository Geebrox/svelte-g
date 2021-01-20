module.exports = {
  plugins: [
    require('tailwindcss')('./tailwind.config.js'),
    require('autoprefixer'),
    require('postcss-preset-env')({
      features: {
        'focus-within-pseudo-class': false
      }
    }),
    require('cssnano')({
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true
          }
        }
      ]
    })
  ]
}
