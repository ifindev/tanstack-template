import { defineConfig } from "prisma/config";

process.loadEnvFile();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
