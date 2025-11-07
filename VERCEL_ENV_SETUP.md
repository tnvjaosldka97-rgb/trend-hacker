# Vercel 환경변수 설정 가이드

## 필수 환경변수

Vercel Dashboard → Settings → Environment Variables에서 다음 변수를 추가하세요:

### 1. VITE_API_URL (필수)
```
VITE_API_URL=https://3000-img3pmgktncvmp41j95mq-fb7a8658.manus-asia.computer/api/trpc
```

**설명:** 백엔드 API 서버 주소입니다. Manus에서 실행 중인 백엔드 서버의 URL을 입력하세요.

### 2. VITE_APP_TITLE (선택)
```
VITE_APP_TITLE=TREND HACKER
```

### 3. VITE_APP_LOGO (선택)
```
VITE_APP_LOGO=/logo.png
```

## 설정 방법

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택: `trend-hacker`
3. Settings → Environment Variables 메뉴
4. "Add New" 버튼 클릭
5. 위 변수들을 하나씩 추가
6. Environment 선택: Production, Preview, Development 모두 체크
7. "Save" 클릭
8. 재배포: Deployments → 최신 배포 → "Redeploy" 클릭

## 재배포 후 확인

재배포가 완료되면 다음 URL에서 확인:
- 홈페이지: https://trend-hacker.vercel.app/
- AI 리포트: https://trend-hacker.vercel.app/reports
- 구독 페이지: https://trend-hacker.vercel.app/subscription
- ETF 분석기: https://trend-hacker.vercel.app/etf

## 문제 해결

### 500 Internal Server Error
- `VITE_API_URL`이 올바르게 설정되었는지 확인
- 백엔드 서버가 실행 중인지 확인
- CORS 에러가 있는지 브라우저 콘솔 확인

### CORS 에러
- 백엔드 CORS 설정에 Vercel 도메인이 포함되어 있음 (이미 설정됨)
- 백엔드 서버가 재시작되었는지 확인

### 데이터가 표시되지 않음
- 백엔드 데이터베이스에 데이터가 있는지 확인
- 크롤링이 완료되었는지 확인
- API 응답이 정상인지 Network 탭에서 확인

## 현재 백엔드 상태

- ✅ CORS 설정 완료 (Vercel 도메인 허용)
- ✅ AI 리포트 스케줄러 실행 중
- 🔄 Twitter 크롤링 진행 중 (약 60분 소요)
- ⏳ YouTube 크롤링 대기 중

## 다음 단계

1. Vercel 환경변수 설정
2. Vercel 재배포
3. 배포 완료 후 테스트
4. 크롤링 완료 대기 (데이터 수집)
5. 최종 확인
