# 관리자 로그인 설정

관리자 로그인(`/admin/login`)이 되려면 **User** 테이블에 **role이 `ADMIN`인 사용자**가 있어야 합니다.

## 방법 1: DB 관리 도구에서 지정 (권장)

1. MySQL 클라이언트(Prisma Studio, phpMyAdmin, MySQL Workbench 등)에서 **User** 테이블 열기
2. `npx prisma studio` 로 Prisma Studio 실행 후 **User** 테이블에서 role 수정 가능
3. 관리자로 쓸 계정 행에서 **role** 값을 **USER** → **ADMIN**으로 변경 후 저장
4. 해당 **아이디/비밀번호**로 `/admin/login`에서 로그인

## 방법 2: SQL로 지정

1. MySQL에서 아래 SQL 실행 (`'내아이디'`를 실제 **username**으로 변경):

```sql
UPDATE User SET role = 'ADMIN' WHERE username = '내아이디';
```

2. 해당 아이디/비밀번호로 `/admin/login` 접속

## 시드 관리자 계정 (DB 연결 가능한 경우)

로컬/배포에서 DB 연결이 정상이면 시드로 관리자 계정을 만들 수 있습니다.

```bash
npm run db:seed
```

- **아이디**: `zwanje`
- **비밀번호**: `1010`
- 이미 있는 `zwanje` 계정은 role이 **ADMIN**으로 갱신됩니다.

## 로그인 시 자주 나오는 메시지

| 메시지 | 의미 |
|--------|------|
| 아이디 또는 비밀번호가 올바르지 않습니다 | 해당 아이디가 없거나 비밀번호 불일치 |
| 관리자만 접근할 수 있습니다 | 로그인한 계정의 role이 USER임 → 위 방법으로 ADMIN으로 변경 |
