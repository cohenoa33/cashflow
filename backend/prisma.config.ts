import { defineConfig,  } from "prisma/config";
    import { config } from "dotenv";

config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL variable is not set');
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL
  }
});
