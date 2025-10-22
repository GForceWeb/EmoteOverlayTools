// vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import react from "@vitejs/plugin-react";
import path from "path";

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

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Configure build options
  build: {
    outDir: "../dist/renderer",
    emptyOutDir: true,
    // Place built assets under overlay/ so the overlay artifact is self-contained for GitHub Pages
    assetsDir: "overlay/assets",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/overlay/index.html"),
        admin: resolve(__dirname, "src/admin/admin.html"),
        // Build the legacy redirect page directly from src/overlay/dist
        "overlay/dist/index": resolve(__dirname, "src/overlay/dist/index.html"),
        // Build the legacy config page directly from src/overlay/config
        "overlay/config/index": resolve(__dirname, "src/overlay/config/index.html"),
      },
    },
  },

  // Copy static assets during build
  publicDir: "../assets",

  // Development server options
  server: {
    open: false, // Prevents the browser from opening automatically
    port: 3000,
  },
});
