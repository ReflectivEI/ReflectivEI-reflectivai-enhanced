import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// import apiRoutes from "vite-plugin-api-routes";

export default defineConfig({
  base: '/ReflectivEI-reflectivai-enhanced/',
  plugins: [
    react(),
    // apiRoutes plugin disabled - using Cloudflare Worker for API endpoints
    // apiRoutes({
    //   moduleId: "virtual:api",
    //   routesDir: path.resolve(__dirname, "server/routes"),
    //   server: "hono",
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  server: {
    port: 5000,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
