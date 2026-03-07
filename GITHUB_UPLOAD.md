# 죽방클럽 홈페이지 Cursor → GitHub 업로드 안내

> **현재 상태**: 이 프로젝트는 이미 `origin`으로 `https://github.com/zwanje1970/jukbang-club`에 연결되어 있으며, `main` 브랜치로 푸시된 상태입니다. 새 PC에서 클론했거나 처음 세팅할 때만 아래 1~6단계를 진행하세요.

---

## 1️⃣ 프로젝트 폴더 선택

- Cursor에서 생성한 프로젝트 **루트**를 선택한 뒤 터미널을 엽니다.

## 2️⃣ Git 초기화 (저장소가 없을 때만)

```bash
git init
```

## 3️⃣ GitHub 원격 저장소 연결

- GitHub에서 새 저장소 생성 (이름 예: `jukbang-club`)
- 터미널 명령:

```bash
git remote add origin https://github.com/zwanje1970/jukbang-club.git
```

- 이미 `origin`이 있으면 주소만 바꾸려면:  
  `git remote set-url origin https://github.com/zwanje1970/jukbang-club.git`

## 4️⃣ 변경 사항 스테이징 및 커밋

```bash
git add .
git commit -m "Cursor에서 생성된 죽방클럽 홈페이지 초기 업로드"
```

## 5️⃣ 브랜치 설정 (처음 올릴 때만)

```bash
git branch -M main
```

## 6️⃣ GitHub로 푸시

```bash
git push -u origin main
```

- 이미 `main`이 `origin/main`을 추적 중이면 이후에는 `git push`만 하면 됩니다.

## 7️⃣ 확인

- 브라우저에서 https://github.com/zwanje1970/jukbang-club 접속
- 코드가 정상적으로 올라왔는지 확인

---

## 💡 팁

- **기존 저장소라면** `git push`만 하면 됩니다.
- 필요 시 `git push --force` 사용 가능 (주의: 원격 히스토리가 덮어씌워집니다.)
- `.gitignore`에 `node_modules`, `.next`, `.env*` 등이 이미 제외되어 있습니다.
