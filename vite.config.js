import * as path from 'path';
import {esbuildCommonjs, viteCommonjs} from '@originjs/vite-plugin-commonjs';
import babel from '@rollup/plugin-babel';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteCommonjs(),
    react(),
    svgr(),
    babel({extensions: ['.ts', '.tsx'], babelHelpers: 'bundled'}),
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
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        // https://github.com/vitejs/vite/issues/5308
        // It's because this packages imports css by their own
        esbuildCommonjs(['react-datetime-picker']),
      ],
    },
  },
});
