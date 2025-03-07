// vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

export default defineConfig({
  // Specify base path if your site is deployed in a subdirectory
  base: "./",

  // Specify the root directory to be the src folder
  root: "src",

  plugins: [
    electron([
      {
        // Main process entry file
        entry: "electron/main.ts",
        onstart(options) {
          if (typeof options.startup === "function") {
            options.startup();
            console.log("Starting Electron app...");
          }
        },
        vite: {
          build: {
            outDir: "dist/electron",
            rollupOptions: {
              external: ["express", "ws"],
              output: {
                format: "cjs",
                entryFileNames: "[name].cjs",
              },
            },
          },
        },
      },
      {
        entry: "electron/preload.ts",
        onstart(options) {
          // Notify the Renderer process to reload
          options.reload();
        },
        vite: {
          build: {
            outDir: "dist/electron",
            rollupOptions: {
              external: ["express", "ws"],
              output: {
                format: "cjs",
                entryFileNames: "[name].cjs",
              },
            },
          },
        },
      },
    ]),
    renderer(),
  ],

  // Configure build options
  build: {
    outDir: "../dist/renderer",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        config: resolve(__dirname, "src/config.html"),
        admin: resolve(__dirname, "src/admin.html"),
      },
    },
  },

  // Copy static assets during build
  publicDir: "../assets",

  // Development server options
  server: {
    open: true,
    port: 3000,
  },
});
