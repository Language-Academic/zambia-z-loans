export default {
  plugins: {
    // Allows you to use @import in your CSS files
    'postcss-import': {},
    // Enables standard CSS nesting (like Sass)
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    // Only runs minification in production to keep dev builds fast
    ...(process.env.NODE_ENV === 'production' ? { cssnano: { preset: 'default' } } : {})
  },
}
