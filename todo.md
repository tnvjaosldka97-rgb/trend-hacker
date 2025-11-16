# Stock Influencer Hub - TODO

## Phase 76: AI 리포트 샘플 페이지 수정 및 PDF 다운로드

### 1. AI 리포트 샘플 페이지 수정
- [ ] "샘플 리포트 생성" 버튼 제거
- [ ] Pro/Premium 샘플 리포트 미리 생성
- [ ] 탭 전환 시 즉시 샘플 표시
- [ ] PDF 다운로드 버튼 추가

### 2. PDF 생성 기능 구현
- [ ] Markdown → PDF 변환 API 구현
- [ ] PDF 다운로드 엔드포인트 추가
- [ ] 프론트엔드 다운로드 버튼 연결

### 3. 테스트 및 배포
- [ ] 샘플 리포트 표시 테스트
- [ ] PDF 다운로드 테스트
- [ ] GitHub 푸시
- [ ] 체크포인트 저장

---

## 이전 작업 (Phase 75 완료)

### Phase 75: 온디맨드 리포트 시스템 구현
- [x] 데이터베이스 스키마 업데이트 (onDemandUsed, onDemandLimit)
- [x] 온디맨드 리포트 API 구현
- [x] 사용 횟수 추적 (Pro: 3회/월, Premium: 무제한)
- [x] Reports 페이지에 리포트 요청 UI 추가
- [x] 구독 페이지 카카오톡 연결


## Phase 77: 구독 관리 시스템 및 무료 체험 제한

### 1. DB 스키마 확장
- [x] freeTrialTracking 테이블 추가 (IP/디바이스 핑거프린트 추적)
- [x] 인덱스 추가 (ipAddress, deviceFingerprint, userId)

### 2. 슈퍼어드민 대시보드
- [x] /admin/subscriptions 페이지 생성
- [x] 사용자 목록 테이블 (이름, 이메일, 플랜, 상태, 만료일)
- [x] 플랜 변경 드롭다운 (Free/Pro/Premium)
- [x] 상태 변경 드롭다운 (Active/Cancelled/Expired)
- [x] 체험 기간 연장 버튼 (+7일, +30일)
- [x] 통계 대시보드 (전체/Free/Pro/Premium 사용자 수)

### 3. 구독 관리 API
- [x] admin 라우터 생성
- [x] listSubscriptions API (사용자 목록 조회)
- [x] updateSubscription API (플랜/상태/만료일 수정)
- [x] adminProcedure 미들웨어 (관리자 권한 체크)

### 4. IP/디바이스 기반 무료 체험 제한
- [x] trial-guard 서비스 생성
- [x] 디바이스 핑거프린트 생성 (User-Agent + IP 해시)
- [x] checkTrialEligibility 함수 (체험 가능 여부 확인)
- [x] 신규 사용자 2일 체험 자동 시작
- [x] 쿠키 삭제 우회 방지 (IP + 디바이스 추적)
- [ ] 미들웨어 통합 (모든 API 요청에 체험 확인 적용)
- [ ] 프론트엔드 체험 만료 알림 UI

### 5. 테스트 및 배포
- [ ] 관리자 대시보드 테스트
- [ ] 무료 체험 제한 테스트 (쿠키 삭제 시나리오)
- [ ] 플랜별 접근 제어 테스트
- [ ] 체크포인트 저장
