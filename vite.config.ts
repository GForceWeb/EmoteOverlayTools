// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Specify base path if your site is deployed in a subdirectory
  base: './',

  // Specify the root directory to be the src folder
  root: 'src',

  // Configure build options
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        config: resolve(__dirname, 'src/config.html')
      }
    }
  },

  // Copy static assets during build
  publicDir: '../assets',

  // Development server options
  server: {
    open: true,
    port: 3000
  }
});