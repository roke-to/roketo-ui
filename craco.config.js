const path = require('path');

module.exports = {
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  webpack: {
    alias: {
      '@uikit': path.join(path.resolve(__dirname, "./src/shared/ui/kit")),
    },
  },
};
