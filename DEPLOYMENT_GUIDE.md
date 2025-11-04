# Trend Hacker 배포 가이드

이 문서는 Trend Hacker를 **Manus 백엔드 + Vercel 프론트엔드**로 분리 배포하는 방법을 설명합니다.

---

## 📋 배포 아키텍처

```
┌─────────────────┐         ┌──────────────────┐
│  Vercel         │  HTTPS  │  Manus           │
│  (Frontend)     │ ───────>│  (Backend API)   │
│  React + Vite   │         │  Express + tRPC  │
└─────────────────┘         └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  TiDB Database   │
                            │  (MySQL)         │
                            └──────────────────┘
```

**장점:**
- 프론트엔드는 Vercel의 글로벌 CDN으로 빠른 로딩
- 백엔드는 Manus에서 안정적으로 실행 (3분 스케줄러 포함)
- 데이터베이스 연결은 백엔드에서만 관리

---

## 🚀 1단계: Manus 백엔드 배포

### 1.1 현재 Manus 프로젝트 게시

1. Management UI 우측 상단의 **"게시"** 버튼 클릭
2. 배포 완료 후 백엔드 URL 확인 (예: `https://3001-xxxxx.manus-asia.computer`)
3. 이 URL을 복사해두세요 (Vercel 설정에 필요)

### 1.2 백엔드 URL 테스트

브라우저에서 다음 URL을 열어 API가 정상 작동하는지 확인:

```
https://your-backend-url.manus-asia.computer/api/trpc/trending.realtime
```

정상이면 JSON 응답이 표시됩니다.

---

## 🌐 2단계: Vercel 프론트엔드 배포

### 2.1 GitHub 저장소 생성

1. GitHub에서 새 저장소 생성
2. 로컬 프로젝트를 GitHub에 푸시:

```bash
cd /home/ubuntu/stock-influencer-hub
git init
git add .
git commit -m "Initial commit - Manus backend + Vercel frontend"
git branch -M main
git remote add origin https://github.com/your-username/trend-hacker.git
git push -u origin main
```

### 2.2 Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. **"New Project"** 클릭
3. GitHub 저장소 선택 (trend-hacker)
4. **Framework Preset**: Vite 선택
5. **Root Directory**: 그대로 두기 (`.`)
6. **Build Command**: `cd client && pnpm install && pnpm build`
7. **Output Directory**: `client/dist`
8. **Install Command**: `pnpm install`

### 2.3 환경변수 설정

Vercel 프로젝트 설정 → **Environment Variables** 탭에서 다음 변수 추가:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `VITE_API_URL` | `https://your-backend-url.manus-asia.computer/api/trpc` | Manus 백엔드 API URL |
| `VITE_APP_TITLE` | `TREND HACKER` | 앱 제목 (선택사항) |
| `VITE_APP_LOGO` | `/logo.png` | 로고 경로 (선택사항) |

**중요:** `VITE_API_URL`은 반드시 Manus 백엔드 URL + `/api/trpc`로 설정하세요!

### 2.4 배포 실행

1. **"Deploy"** 버튼 클릭
2. 배포 완료 대기 (약 2-3분)
3. 배포 완료 후 Vercel URL 확인 (예: `https://trend-hacker.vercel.app`)

---

## 🔧 3단계: CORS 설정 업데이트

Vercel 배포 완료 후 Manus 백엔드에서 Vercel 도메인을 허용해야 합니다.

### 3.1 Manus 프로젝트에서 환경변수 추가

Management UI → **Settings** → **Secrets** 탭에서:

| 변수명 | 값 |
|--------|-----|
| `FRONTEND_URL` | `https://trend-hacker.vercel.app` |

### 3.2 서버 재시작

환경변수 추가 후 Management UI에서 서버를 재시작하면 CORS 설정이 자동으로 적용됩니다.

---

## ✅ 4단계: 배포 확인

### 4.1 프론트엔드 접속

브라우저에서 Vercel URL 접속:
```
https://trend-hacker.vercel.app
```

### 4.2 데이터 로딩 확인

- **실시간 (3분)** 탭에 데이터가 표시되는지 확인
- 브라우저 개발자 도구 → Console에서 에러 확인
- Network 탭에서 API 요청이 Manus 백엔드로 가는지 확인

### 4.3 문제 해결

**데이터가 안 보이는 경우:**

1. 브라우저 Console에서 CORS 에러 확인
   - 에러 메시지: `Access-Control-Allow-Origin`
   - 해결: Manus 환경변수 `FRONTEND_URL` 확인

2. API URL 확인
   - Vercel 환경변수 `VITE_API_URL`이 올바른지 확인
   - 끝에 `/api/trpc`가 있는지 확인

3. 백엔드 상태 확인
   - Manus Management UI에서 서버 로그 확인
   - API 직접 호출 테스트

---

## 📊 데이터 수집 스케줄러

백엔드는 Manus에서 실행되므로 **3분마다 자동 데이터 수집**이 계속 작동합니다.

- 스케줄러는 서버 시작 시 자동 실행
- Management UI → Preview에서 로그 확인 가능
- Twitter API rate limit 해제 후 자동으로 데이터 수집 재개

---

## 🔄 업데이트 방법

### 프론트엔드 업데이트

1. 코드 수정 후 GitHub에 푸시
```bash
git add .
git commit -m "Update frontend"
git push
```

2. Vercel이 자동으로 재배포 (약 2분)

### 백엔드 업데이트

1. Manus Management UI에서 코드 수정
2. 체크포인트 저장
3. **"게시"** 버튼 클릭

---

## 🎯 최종 체크리스트

- [ ] Manus 백엔드 배포 완료
- [ ] 백엔드 API URL 확인
- [ ] GitHub 저장소 생성 및 푸시
- [ ] Vercel 프로젝트 생성
- [ ] Vercel 환경변수 설정 (`VITE_API_URL`)
- [ ] Vercel 배포 완료
- [ ] Manus 환경변수 설정 (`FRONTEND_URL`)
- [ ] CORS 설정 확인
- [ ] 프론트엔드에서 데이터 로딩 확인
- [ ] 스케줄러 동작 확인

---

## 💡 추가 정보

### 비용

- **Vercel**: 무료 플랜 (Hobby) 사용 가능
- **Manus**: 현재 플랜 유지
- **TiDB**: 현재 플랜 유지

### 성능

- 프론트엔드: Vercel CDN으로 전 세계 빠른 로딩
- 백엔드: Manus 서버에서 안정적 실행
- 데이터베이스: TiDB 클라우드 (고성능)

### 보안

- CORS 설정으로 허용된 도메인만 API 접근 가능
- 환경변수로 민감 정보 관리
- HTTPS 통신 (Vercel, Manus 모두 지원)

---

## 🆘 문제 해결

### CORS 에러

```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**해결:**
1. Manus 환경변수 `FRONTEND_URL`이 Vercel URL과 일치하는지 확인
2. Manus 서버 재시작
3. 브라우저 캐시 삭제 후 재접속

### API 연결 실패

```
Failed to fetch
```

**해결:**
1. `VITE_API_URL`이 올바른지 확인
2. Manus 백엔드가 실행 중인지 확인
3. 백엔드 URL 직접 접속 테스트

### 빌드 에러

```
Error: Cannot find module 'xxx'
```

**해결:**
1. `package.json`에 필요한 패키지가 있는지 확인
2. Vercel 빌드 로그 확인
3. 로컬에서 `pnpm build` 테스트

---

**배포 완료 후 Vercel URL을 공유하시면 확인해드리겠습니다!** 🚀
