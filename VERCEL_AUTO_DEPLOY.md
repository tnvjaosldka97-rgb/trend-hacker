# 🚀 Vercel 자동 배포 가이드 (GitHub 연동)

## ✅ GitHub 저장소 준비 완료!

저장소 URL: **https://github.com/tnvjaosldka97-rgb/trend-hacker**

---

## 📍 Vercel 자동 배포 설정 (3분)

### 1️⃣ Vercel 로그인

1. [Vercel](https://vercel.com) 접속
2. **"Sign Up"** 또는 **"Login"** 클릭
3. **GitHub 계정으로 로그인** (tnvjaosldka97-rgb)
4. GitHub 연동 허용

---

### 2️⃣ 새 프로젝트 생성

1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. **"Import Git Repository"** 섹션에서:
   - `tnvjaosldka97-rgb/trend-hacker` 저장소 찾기
   - **"Import"** 버튼 클릭

💡 저장소가 안 보이면 **"Adjust GitHub App Permissions"** 클릭 → 저장소 접근 허용

---

### 3️⃣ 프로젝트 설정

**Framework Preset**: Vite (자동 감지)

**Root Directory**: `.` (그대로 두기)

**Build and Output Settings**:
- ✅ **Override** 체크
- **Build Command**: 
  ```
  cd client && pnpm install && pnpm build
  ```
- **Output Directory**: 
  ```
  client/dist
  ```
- **Install Command**: 
  ```
  pnpm install
  ```

---

### 4️⃣ 환경변수 설정 (중요!)

**Environment Variables** 섹션에서:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://3001-img3pmgktncvmp41j95mq-fb7a8658.manus-asia.computer/api/trpc` |

⚠️ **주의**: 
- Manus 백엔드 URL 뒤에 `/api/trpc` 붙이기!
- 현재 Manus URL: `https://3001-img3pmgktncvmp41j95mq-fb7a8658.manus-asia.computer`

---

### 5️⃣ 배포 시작

**"Deploy"** 버튼 클릭!

⏱️ 배포 시간: 약 2-3분

배포 완료 후 Vercel URL이 생성됩니다:
- 예시: `https://trend-hacker.vercel.app`
- 또는: `https://trend-hacker-xxx.vercel.app`

---

## 📍 CORS 설정 (필수!)

Vercel 배포 완료 후:

### 1️⃣ Vercel URL 복사

배포 완료 페이지에서 URL 복사
- 예시: `https://trend-hacker.vercel.app`

### 2️⃣ Manus 환경변수 추가

1. **Manus Management UI** 접속
2. 우측 상단 **톱니바퀴 아이콘** → **"Settings"**
3. 좌측 메뉴 **"Secrets"** 클릭
4. **"Add Secret"** 버튼 클릭
5. 다음 정보 입력:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://trend-hacker.vercel.app` (Vercel URL)
6. **"Save"** 클릭

### 3️⃣ Manus 서버 재시작

1. Management UI 좌측 메뉴 **"Preview"** 클릭
2. 우측 상단 **"Restart"** 버튼 클릭
3. 서버 재시작 대기 (약 10초)

---

## ✅ 배포 확인

### 프론트엔드 접속

브라우저에서 Vercel URL 접속:
```
https://trend-hacker.vercel.app
```

### 데이터 확인

1. **"오늘 (24h)"** 탭 클릭
2. 종목 데이터 확인 (TSLA, NVDA, AAPL 등)
3. 데이터가 보이면 **배포 성공!** 🎉

---

## 🔄 자동 배포 (Git Push)

이제부터 코드 수정 후 GitHub에 푸시하면 **Vercel이 자동으로 재배포**합니다!

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel이 자동으로:
1. 코드 변경 감지
2. 빌드 실행
3. 배포 완료 (약 2분)

---

## ❌ 문제 해결

### 데이터가 안 보이는 경우

1. **F12** → Console 탭 확인
2. CORS 에러 확인:
   ```
   Access-Control-Allow-Origin
   ```
3. 해결:
   - Manus 환경변수 `FRONTEND_URL` 확인
   - Manus 서버 재시작
   - 브라우저 새로고침 (Ctrl+Shift+R)

### 빌드 에러

1. Vercel 대시보드 → Deployments 탭
2. 실패한 배포 클릭 → 로그 확인
3. 빌드 명령어 확인:
   ```
   cd client && pnpm install && pnpm build
   ```

### 환경변수 수정

1. Vercel 대시보드 → Settings → Environment Variables
2. `VITE_API_URL` 수정
3. **"Redeploy"** 버튼 클릭

---

## 🎯 최종 체크리스트

- [ ] GitHub 저장소 확인 (https://github.com/tnvjaosldka97-rgb/trend-hacker)
- [ ] Vercel 로그인 (GitHub 계정)
- [ ] Vercel 프로젝트 생성
- [ ] 빌드 설정 완료
- [ ] 환경변수 `VITE_API_URL` 설정
- [ ] Vercel 배포 완료
- [ ] Vercel URL 확인
- [ ] Manus 환경변수 `FRONTEND_URL` 추가
- [ ] Manus 서버 재시작
- [ ] 프론트엔드 데이터 확인

---

## 💡 추가 정보

### Vercel 도메인 커스텀

무료로 커스텀 도메인 연결 가능:
1. Vercel 대시보드 → Settings → Domains
2. 도메인 입력 → DNS 설정
3. 자동 HTTPS 적용

### 성능 최적화

- Vercel CDN으로 전 세계 빠른 로딩
- 자동 이미지 최적화
- Edge Functions 지원

### 비용

- **Vercel Hobby 플랜**: 완전 무료
- 월 100GB 대역폭
- 무제한 배포

---

**이제 Vercel에서 프로젝트를 Import하면 자동 배포됩니다!** 🚀

**어느 단계에서 막히시면 바로 말씀해주세요!**
