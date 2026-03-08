/**
 * Vercel 등: DATABASE_URL이 이미 설정되어 있으면 그대로 Prisma generate + Next build 실행.
 * DATABASE_URL이 없으면 경고만 출력하고 빌드 진행 (Prisma는 나중에 런타임에서 실패).
 */
const { execSync } = require("child_process");

function main() {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "scripts/set-database-url.js: DATABASE_URL이 설정되지 않았습니다. Neon 등에서 postgresql URL을 설정하세요."
    );
  }
  runBuild();
}

function runBuild() {
  execSync("npx prisma generate && next build", {
    stdio: "inherit",
    env: process.env,
  });
}

main();
