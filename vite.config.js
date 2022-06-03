import * as path from 'path';
import {defineConfig} from 'vite';

import babel from '@rollup/plugin-babel';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    babel({extensions: ['.ts', '.tsx']}),
  ],
  resolve: {
    alias: [
      {find: '~', replacement: path.resolve('src')},
      {
        find: '@ui',
        replacement: path.resolve('src', 'shared', 'ui'),
      },
    ],
  },
});
