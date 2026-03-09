/**
 * Neon / PostgreSQL에 'users' 테이블을 생성하는 스크립트.
 * 컬럼: id, name, score, profile_url
 *
 * 실행: npx tsx scripts/create-users-table.ts
 * (프로젝트 루트의 .env에 POSTGRES_URL 또는 DATABASE_URL 이 있으면 자동 로드)
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_CONNECTION_STRING;

  if (!connectionString) {
    console.error(
      "연결 문자열이 없습니다. .env에 POSTGRES_URL 또는 DATABASE_URL을 설정하거나,\n" +
        "실행 시 환경변수로 지정하세요.\n" +
        "예: set DATABASE_URL=postgresql://... && npx tsx scripts/create-users-table.ts"
    );
    process.exit(1);
  }

  const sql = neon(connectionString);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        TEXT,
        score       INTEGER DEFAULT 0,
        profile_url TEXT
      )
    `;
    console.log("'users' 테이블이 생성되었습니다 (이미 있으면 무시됨).");
  } catch (e) {
    console.error("테이블 생성 실패:", e);
    process.exit(1);
  }
}

main();
