import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  vite: {
    plugins: [tsconfigPaths(), tailwindcss()],
    server: {
      host: true,
      port: 3000,
      hmr: { clientPort: 3000 },
    },
  },
});
