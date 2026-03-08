/**
 * For Vercel (or any env that only has DB_HOST, DB_USER, etc.):
 * Build DATABASE_URL from separate vars so Prisma can use it.
 * If DATABASE_URL is already set, this is a no-op.
 * Run before prisma generate / next build.
 */
const { execSync } = require("child_process");

function main() {
  if (process.env.DATABASE_URL) {
    // Already set (e.g. single env var in Vercel)
    runBuild();
    return;
  }

  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.warn(
      "scripts/set-database-url.js: DATABASE_URL not set and DB_HOST/DB_USER/DB_NAME missing. Prisma may fail."
    );
    runBuild();
    return;
  }

  const port = DB_PORT || "3306";
  const password = DB_PASSWORD != null ? encodeURIComponent(DB_PASSWORD) : "";
  process.env.DATABASE_URL = `mysql://${DB_USER}:${password}@${DB_HOST}:${port}/${DB_NAME}`;
  runBuild();
}

function runBuild() {
  execSync("npx prisma generate && next build", {
    stdio: "inherit",
    env: process.env,
  });
}

main();
