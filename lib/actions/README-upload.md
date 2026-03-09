# 통합 업로드 (Vercel Blob)

이미지 업로드는 모두 `uploadFile(file, menuName)` Server Action을 사용하며, `menuName`에 따라 Blob에 저장되는 경로가 달라집니다.

## 메뉴별 저장 폴더

| menuName   | Blob 경로       | 사용처 |
|-----------|------------------|--------|
| notice    | notices/         | 공지 등 |
| tournament| tournaments/     | 대회 신청 (경기 기록 이미지) |
| settings  | settings/        | 관리자 설정 (메인 배너 등) |
| competition| competitions/   | 대회 이미지 |
| lesson    | lessons/         | 당구교실 홍보 이미지 |
| board     | boards/          | 게시판 리치 에디터 이미지 |
| venue     | venue/           | 당구장 안내 에디터 이미지 |
| broadcast | broadcast/       | 유튜브 중계 등 |

## Vercel 대시보드에서 폴더별로 보기

1. [Vercel 대시보드](https://vercel.com) → 프로젝트 선택
2. **Storage** → 사용 중인 **Blob** 스토어 클릭
3. 파일 목록에서 **pathname** 컬럼을 보면 `notices/...`, `tournaments/...` 등으로 저장됨
4. 검색/필터에 `notices/` 또는 `tournaments/` 등을 입력하면 해당 메뉴 업로드만 모아서 볼 수 있음

Blob은 실제 폴더 구조가 아니라 pathname(경로 문자열)으로 저장하므로, 접두어로 구분해 폴더처럼 사용합니다.
