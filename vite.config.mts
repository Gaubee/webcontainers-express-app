import { defineConfig } from "vite";

export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: "./index.html",
        files: "./src/files.ts",
        terminal: "./src/terminal.ts",
      },
    },
    minify: false,
  },
});
