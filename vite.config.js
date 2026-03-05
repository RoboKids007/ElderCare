import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: process.env.VITE_BASE_PATH || "/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});