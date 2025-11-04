# 🚀 Vercel 초간단 배포 가이드 (5분 완성)

## 📦 준비물

1. **빌드된 프론트엔드 파일**: `frontend-build.tar.gz` (이미 준비됨)
2. **Manus 백엔드 URL**: 현재 실행 중인 URL
   - 예시: `https://3001-img3pmgktncvmp41j95mq-fb7a8658.manus-asia.computer`

---

## 🎯 배포 단계 (3단계만!)

### 1️⃣ 빌드 파일 다운로드

Management UI → **Code** 탭 → **Download** 버튼 클릭
- 파일명: `frontend-build.tar.gz`
- 압축 해제하면 `index.html`, `assets/` 폴더가 나옵니다

### 2️⃣ Vercel에 드래그 앤 드롭

1. [Vercel 배포 페이지](https://vercel.com/new) 접속
2. **"Deploy without Git"** 섹션 찾기
3. 압축 해제한 폴더를 **드래그 앤 드롭**
4. **Project Name** 입력: `trend-hacker`
5. **Environment Variables** 추가:
   ```
   Name: VITE_API_URL
   Value: https://3001-img3pmgktncvmp41j95mq-fb7a8658.manus-asia.computer/api/trpc
   ```
   ⚠️ **주의**: Manus 백엔드 URL 뒤에 `/api/trpc` 붙이기!

6. **Deploy** 버튼 클릭!

### 3️⃣ CORS 설정 (필수!)

Vercel 배포 완료 후:

1. **Vercel URL 복사** (예: `https://trend-hacker.vercel.app`)
2. **Manus Management UI** → Settings → Secrets
3. **Add Secret**:
   - Key: `FRONTEND_URL`
   - Value: `https://trend-hacker.vercel.app`
4. **서버 재시작**: Preview → Restart 버튼

---

## ✅ 완료!

브라우저에서 Vercel URL 접속:
```
https://trend-hacker.vercel.app
```

**"오늘 (24h)"** 탭에서 데이터가 보이면 성공! 🎉

---

## 🔄 업데이트 방법

코드 수정 후:
1. `pnpm build` 실행
2. 빌드 파일 다시 압축
3. Vercel에 다시 드래그 앤 드롭

---

## ❌ 문제 해결

### 데이터가 안 보이는 경우

1. **F12** → Console 탭 확인
2. CORS 에러가 있다면:
   - Manus 환경변수 `FRONTEND_URL` 확인
   - Manus 서버 재시작
   - 브라우저 새로고침 (Ctrl+Shift+R)

### API 연결 실패

1. Vercel 환경변수 `VITE_API_URL` 확인
2. Manus 백엔드가 실행 중인지 확인
3. 백엔드 URL 직접 접속 테스트

---

**이게 가장 빠른 방법입니다!** 🚀
