# Supabase migrations

## "schema_migrations does not exist" 오류 해결

원격 Supabase에 마이그레이션을 적용하려면:

1. **CLI 로그인** (최초 1회, `Access token not provided` 오류 시 필수)
   ```bash
   npx supabase login
   ```
   - 브라우저가 열리면 Supabase 계정으로 로그인
   - 또는 [Access Tokens](https://supabase.com/dashboard/account/tokens)에서 토큰 발급 후:
     ```bash
     set SUPABASE_ACCESS_TOKEN=your-token
     ```

2. **프로젝트 연결** (최초 1회)
   ```bash
   npx supabase link
   ```
   - Supabase 대시보드에서 프로젝트 ref 확인
   - DB 비밀번호 입력

3. **마이그레이션 푸시**
   ```bash
   npx supabase db push
   ```
   - `000_schema_migrations.sql`: `supabase_migrations.schema_migrations` 테이블 생성
   - `001_init.sql`: `tournaments` 테이블 생성

로그인 → 연결 → 푸시 순서로 실행하면 오류가 해결됩니다.
