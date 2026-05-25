import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackStart(), // Must come before react()
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    host: true,
    port: 3000,
    hmr: { clientPort: 3000 },
  },
});
