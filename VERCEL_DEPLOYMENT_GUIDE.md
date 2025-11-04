# Trend Hacker - Vercel 배포 가이드

**작성자:** Manus AI  
**최종 업데이트:** 2025년 11월 4일

---

## 개요

본 문서는 Trend Hacker 프로젝트를 Vercel에 배포하기 위한 상세 가이드입니다. Vercel은 Next.js 및 React 애플리케이션을 위한 클라우드 플랫폼으로, 자동 배포, 글로벌 CDN, 서버리스 함수를 제공합니다.

## 프로젝트 구조

Trend Hacker는 다음과 같은 기술 스택으로 구성되어 있습니다.

| 구성 요소 | 기술 스택 |
|---------|---------|
| 프론트엔드 | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| 백엔드 | Express 4 + tRPC 11 |
| 데이터베이스 | MySQL (TiDB) |
| 인증 | Manus OAuth |
| 데이터 수집 | Node.js 스케줄러 (cron) |

---

## 1단계: 프로젝트 파일 다운로드

Manus Management UI에서 프로젝트 파일을 다운로드합니다.

1. Management UI 우측 패널에서 **Code** 탭 클릭
2. 우측 상단의 **"Download All Files"** 버튼 클릭
3. ZIP 파일 다운로드 및 압축 해제

다운로드한 파일 구조는 다음과 같습니다.

```
stock-influencer-hub/
├── client/              # 프론트엔드 (React + Vite)
├── server/              # 백엔드 (Express + tRPC)
├── drizzle/             # 데이터베이스 스키마
├── scripts/             # 데이터 수집 스크립트
├── package.json
└── ...
```

---

## 2단계: GitHub 리포지토리 생성

Vercel은 GitHub, GitLab, Bitbucket과 연동하여 자동 배포를 지원합니다. GitHub를 사용하는 것을 권장합니다.

1. [GitHub](https://github.com)에 로그인
2. 새 리포지토리 생성 (예: `trend-hacker`)
3. 다운로드한 프로젝트 폴더를 Git 리포지토리로 초기화

```bash
cd stock-influencer-hub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trend-hacker.git
git push -u origin main
```

---

## 3단계: 데이터베이스 준비

Vercel에서는 데이터베이스를 직접 제공하지 않으므로, 외부 MySQL 데이터베이스가 필요합니다.

### 옵션 1: PlanetScale (권장)

PlanetScale은 MySQL 호환 서버리스 데이터베이스로, Vercel과 완벽하게 통합됩니다.

1. [PlanetScale](https://planetscale.com) 계정 생성
2. 새 데이터베이스 생성 (예: `trendhacker`)
3. **Connection String** 복사 (형식: `mysql://...`)

### 옵션 2: Railway

Railway는 PostgreSQL, MySQL 등 다양한 데이터베이스를 제공합니다.

1. [Railway](https://railway.app) 계정 생성
2. MySQL 데이터베이스 생성
3. **DATABASE_URL** 복사

### 옵션 3: 기존 MySQL 서버

이미 MySQL 서버가 있다면 해당 연결 정보를 사용할 수 있습니다. 단, 외부 접속이 허용되어야 합니다.

---

## 4단계: 데이터베이스 스키마 마이그레이션

데이터베이스 연결 후, 스키마를 마이그레이션해야 합니다.

1. 로컬에서 `.env` 파일 생성

```bash
DATABASE_URL="mysql://your-connection-string"
```

2. 의존성 설치

```bash
pnpm install
```

3. 데이터베이스 마이그레이션 실행

```bash
pnpm db:push
```

이 명령은 `drizzle/schema.ts`에 정의된 테이블을 데이터베이스에 생성합니다.

---

## 5단계: 필요한 환경변수 확인

Trend Hacker는 다음 환경변수가 필요합니다. Vercel 배포 시 모두 설정해야 합니다.

### 필수 환경변수

| 변수명 | 설명 | 예시 |
|-------|------|------|
| `DATABASE_URL` | MySQL 연결 문자열 | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | 세션 쿠키 서명 비밀키 | 랜덤 문자열 (32자 이상) |
| `RAPIDAPI_KEY` | Twitter API 키 (RapidAPI) | `your-rapidapi-key` |

### 선택적 환경변수 (Manus 전용)

다음 변수는 Manus 플랫폼 전용이므로 Vercel에서는 **사용하지 않습니다**.

- `BUILT_IN_FORGE_API_KEY`
- `BUILT_IN_FORGE_API_URL`
- `VITE_FRONTEND_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`
- `OAUTH_SERVER_URL`
- `VITE_OAUTH_PORTAL_URL`
- `OWNER_OPEN_ID`
- `OWNER_NAME`

### 프론트엔드 환경변수

| 변수명 | 설명 | 예시 |
|-------|------|------|
| `VITE_APP_TITLE` | 웹사이트 제목 | `Trend Hacker` |
| `VITE_APP_LOGO` | 로고 이미지 URL | `/logo.png` |
| `VITE_APP_ID` | 앱 ID (선택) | `trendhacker` |

---

## 6단계: Vercel 프로젝트 생성

1. [Vercel](https://vercel.com)에 로그인
2. **"New Project"** 클릭
3. GitHub 리포지토리 연결
4. `trend-hacker` 리포지토리 선택
5. **"Import"** 클릭

---

## 7단계: 빌드 설정 구성

Vercel은 자동으로 프로젝트를 감지하지만, 수동 설정이 필요할 수 있습니다.

### Framework Preset

- **Framework:** Vite

### Build & Development Settings

| 설정 | 값 |
|------|-----|
| Build Command | `pnpm build` |
| Output Directory | `client/dist` |
| Install Command | `pnpm install` |

### Root Directory

프로젝트 루트를 그대로 사용합니다 (변경 불필요).

---

## 8단계: 환경변수 설정

Vercel 프로젝트 설정에서 환경변수를 추가합니다.

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** → **Environment Variables** 클릭
3. 다음 변수 추가

```
DATABASE_URL=mysql://your-connection-string
JWT_SECRET=your-random-secret-key-32-chars-minimum
RAPIDAPI_KEY=your-rapidapi-key
VITE_APP_TITLE=Trend Hacker
VITE_APP_LOGO=/logo.png
VITE_APP_ID=trendhacker
```

### JWT_SECRET 생성 방법

안전한 랜덤 문자열을 생성합니다.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### RAPIDAPI_KEY 발급 방법

1. [RapidAPI](https://rapidapi.com) 계정 생성
2. [Twitter API](https://rapidapi.com/hub) 검색
3. 적절한 Twitter API 구독 (무료 플랜 가능)
4. API 키 복사

---

## 9단계: 배포 실행

환경변수 설정 완료 후, Vercel이 자동으로 배포를 시작합니다.

1. **Deployments** 탭에서 진행 상황 확인
2. 빌드 로그 확인 (에러 발생 시)
3. 배포 완료 후 URL 확인 (예: `https://trend-hacker.vercel.app`)

---

## 10단계: 커스텀 도메인 연결 (선택)

Vercel은 무료로 `.vercel.app` 도메인을 제공하지만, 커스텀 도메인을 연결할 수 있습니다.

1. Vercel 프로젝트 **Settings** → **Domains** 클릭
2. 커스텀 도메인 입력 (예: `trendhacker.com`)
3. DNS 설정 지침 따르기
4. DNS 전파 대기 (최대 48시간)

### DNS 설정 예시

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

---

## 중요 제약사항

Vercel 배포 시 다음 기능이 **작동하지 않습니다**.

### 1. 자동 데이터 수집 스케줄러

Vercel은 서버리스 환경이므로, `cron` 기반 스케줄러가 작동하지 않습니다.

**해결 방법:**
- Vercel Cron Jobs 사용 (Pro 플랜 필요)
- 외부 스케줄러 사용 (GitHub Actions, Render Cron 등)
- 수동 트리거 API 엔드포인트 생성

### 2. Manus OAuth 인증

Manus OAuth는 Manus 플랫폼 전용이므로 Vercel에서 작동하지 않습니다.

**해결 방법:**
- NextAuth.js로 대체
- Auth0, Clerk 등 외부 인증 서비스 사용
- 인증 기능 제거 (공개 웹사이트로 운영)

### 3. Manus 전용 API

`BUILT_IN_FORGE_API_*` 환경변수는 Manus 플랫폼 전용입니다.

**해결 방법:**
- 해당 기능 제거
- 대체 API 사용 (OpenAI API, 직접 Twitter API 호출 등)

---

## 문제 해결

### 빌드 실패

**증상:** Vercel 빌드가 실패합니다.

**해결 방법:**
1. 빌드 로그 확인
2. 로컬에서 `pnpm build` 실행하여 에러 재현
3. 의존성 버전 확인 (`package.json`)
4. Node.js 버전 확인 (Vercel은 Node 18+ 권장)

### 데이터베이스 연결 실패

**증상:** 배포 후 데이터베이스 연결 에러 발생

**해결 방법:**
1. `DATABASE_URL` 환경변수 확인
2. 데이터베이스 외부 접속 허용 확인
3. SSL 연결 필요 시 `?ssl=true` 추가

```
DATABASE_URL=mysql://user:pass@host:3306/db?ssl=true
```

### 환경변수 미적용

**증상:** 환경변수가 코드에서 읽히지 않습니다.

**해결 방법:**
1. Vercel 대시보드에서 환경변수 재확인
2. 프론트엔드 변수는 `VITE_` 접두사 필수
3. 재배포 실행 (환경변수 변경 후 자동 재배포 안 됨)

### 스케줄러 미작동

**증상:** 3분마다 데이터 수집이 실행되지 않습니다.

**해결 방법:**
- Vercel Cron Jobs 설정 (Pro 플랜)
- 또는 GitHub Actions로 대체

**GitHub Actions 예시:**

`.github/workflows/data-collection.yml` 파일 생성

```yaml
name: Data Collection

on:
  schedule:
    - cron: '*/3 * * * *'  # 3분마다 실행

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm tsx scripts/collect-twitter-data-v2.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          RAPIDAPI_KEY: ${{ secrets.RAPIDAPI_KEY }}
```

---

## 대안: Render 배포

Vercel의 제약사항이 부담스럽다면, Render를 사용하는 것도 좋은 선택입니다. Render는 백그라운드 워커와 cron 작업을 무료로 지원합니다.

### Render 장점

- 무료 플랜에서 cron 작업 지원
- 백그라운드 워커 지원
- PostgreSQL 무료 제공
- 환경변수 관리 간편

### Render 배포 방법

1. [Render](https://render.com) 계정 생성
2. GitHub 리포지토리 연결
3. **Web Service** 생성
4. 빌드 명령: `pnpm build`
5. 시작 명령: `pnpm start`
6. 환경변수 설정
7. **Cron Job** 추가 (데이터 수집용)

---

## 결론

Vercel 배포는 프론트엔드 중심의 정적 사이트에 최적화되어 있습니다. Trend Hacker는 백엔드 스케줄러와 데이터베이스를 사용하므로, 추가 설정이 필요합니다.

**권장 배포 방법:**

1. **Manus 배포** (가장 간단) - 클릭 한 번으로 모든 기능 작동
2. **Render 배포** (무료 cron 지원) - 백그라운드 작업 필요 시
3. **Vercel 배포** (커스텀 도메인 중요 시) - 스케줄러는 외부 서비스 사용

본 가이드를 따라 Vercel에 성공적으로 배포하시기 바랍니다. 추가 질문이 있으시면 언제든지 문의해 주세요.

---

**작성자:** Manus AI  
**문서 버전:** 1.0  
**최종 업데이트:** 2025년 11월 4일
