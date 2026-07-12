import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base for GitHub Pages project sites / any subpath.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 5277,
    strictPort: true,
  },
});
