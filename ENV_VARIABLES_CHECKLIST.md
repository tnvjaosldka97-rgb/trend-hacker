# Trend Hacker - 환경변수 체크리스트

Vercel 배포 시 설정해야 할 환경변수 목록입니다.

## 필수 환경변수

### 1. DATABASE_URL
- **설명:** MySQL 데이터베이스 연결 문자열
- **형식:** `mysql://username:password@host:port/database`
- **예시:** `mysql://user:pass@db.example.com:3306/trendhacker`
- **발급처:** PlanetScale, Railway, 또는 자체 MySQL 서버

### 2. JWT_SECRET
- **설명:** 세션 쿠키 서명을 위한 비밀키
- **형식:** 32자 이상의 랜덤 문자열
- **생성 방법:**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **예시:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

### 3. RAPIDAPI_KEY
- **설명:** Twitter API 호출을 위한 RapidAPI 키
- **발급처:** [RapidAPI](https://rapidapi.com)
- **발급 방법:**
  1. RapidAPI 계정 생성
  2. Twitter API 검색 및 구독
  3. API 키 복사
- **예시:** `1234567890abcdef1234567890abcdef`

---

## 프론트엔드 환경변수 (선택)

### 4. VITE_APP_TITLE
- **설명:** 웹사이트 제목
- **기본값:** `Trend Hacker`
- **예시:** `Trend Hacker`

### 5. VITE_APP_LOGO
- **설명:** 로고 이미지 경로
- **기본값:** `/logo.png`
- **예시:** `/logo.png`

### 6. VITE_APP_ID
- **설명:** 앱 고유 ID
- **기본값:** `trendhacker`
- **예시:** `trendhacker`

---

## Manus 전용 환경변수 (Vercel에서 사용 안 함)

다음 변수는 Manus 플랫폼 전용이므로 Vercel 배포 시 **설정하지 않습니다**.

- ~~`BUILT_IN_FORGE_API_KEY`~~
- ~~`BUILT_IN_FORGE_API_URL`~~
- ~~`VITE_FRONTEND_FORGE_API_KEY`~~
- ~~`VITE_FRONTEND_FORGE_API_URL`~~
- ~~`OAUTH_SERVER_URL`~~
- ~~`VITE_OAUTH_PORTAL_URL`~~
- ~~`VITE_APP_ID`~~ (Manus OAuth 관련)
- ~~`OWNER_OPEN_ID`~~
- ~~`OWNER_NAME`~~
- ~~`VITE_ANALYTICS_ENDPOINT`~~
- ~~`VITE_ANALYTICS_WEBSITE_ID`~~

---

## Vercel 환경변수 설정 방법

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** → **Environment Variables** 클릭
3. 각 변수 추가:
   - **Name:** 변수명 입력
   - **Value:** 값 입력
   - **Environment:** Production, Preview, Development 선택
4. **Save** 클릭

---

## 환경변수 설정 예시

```env
# 필수
DATABASE_URL=mysql://user:pass@db.example.com:3306/trendhacker
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
RAPIDAPI_KEY=1234567890abcdef1234567890abcdef

# 선택
VITE_APP_TITLE=Trend Hacker
VITE_APP_LOGO=/logo.png
VITE_APP_ID=trendhacker
```

---

## 체크리스트

배포 전 다음 항목을 확인하세요:

- [ ] `DATABASE_URL` 설정 완료
- [ ] `JWT_SECRET` 생성 및 설정 완료
- [ ] `RAPIDAPI_KEY` 발급 및 설정 완료
- [ ] `VITE_APP_TITLE` 설정 (선택)
- [ ] `VITE_APP_LOGO` 설정 (선택)
- [ ] `VITE_APP_ID` 설정 (선택)
- [ ] 데이터베이스 스키마 마이그레이션 완료 (`pnpm db:push`)
- [ ] 로컬 빌드 테스트 완료 (`pnpm build`)
- [ ] Vercel 배포 실행
- [ ] 배포 후 웹사이트 접속 테스트

---

**작성자:** Manus AI  
**최종 업데이트:** 2025년 11월 4일
