import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  base: "./",
});
