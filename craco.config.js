const path = require('path');

module.exports = {
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  webpack: {
    alias: {
      '@app': path.join(path.resolve(__dirname, "./src")),
      '@uikit': path.join(path.resolve(__dirname, "./src/shared/ui/kit")),
    },
  },
};
