import { defineConfig } from "drizzle-kit";

const tursoUrl = process.env.TURSO_DB_URL;
const tursoToken = process.env.TURSO_DB_TOKEN;

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: tursoUrl ? "turso" : "sqlite",
  dbCredentials: tursoUrl
    ? { url: tursoUrl, authToken: tursoToken }
    : { url: "./data/lepharo.db" },
});
