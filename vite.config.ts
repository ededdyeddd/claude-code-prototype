import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves the app from /<repo>/: scripts/deploy-pages.sh sets BASE_PATH.
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  server: { port: Number(process.env.PORT) || 5173 },
});
