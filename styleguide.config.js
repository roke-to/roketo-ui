const path = require('path');

module.exports = {
  title: 'Roketo UI-kit',
  components: path.join(path.resolve(__dirname, './src/shared/ui/kit/**/[A-Z]*.{js,jsx,ts,tsx}')),
}
