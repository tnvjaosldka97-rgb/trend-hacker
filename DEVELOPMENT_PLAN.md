# TREND HACKER 개발 계획서

## 📋 현재 상태
- ✅ 오늘/주간/월간 전문가 의견 종목 (매일 새벽 3시 크롤링)
- ✅ Twitter + YouTube 데이터 수집
- ✅ 감성 분석 (상승/하락/중립)
- ✅ 전문가별 의견 상세 표시

## 🎯 추가 개발 항목

### 1. 티커 표시 기능 (주린이 친화)
**문제점:**
- 초보 투자자들은 티커(AAPL, TSLA 등)가 어떤 회사인지 모름
- 티커만 보고는 어떤 종목인지 파악하기 어려움

**해결책:**
- 모든 티커 옆에 회사명 자동 표시
  * 예: `$AAPL (Apple Inc.)`
  * 예: `$TSLA (Tesla, Inc.)`
- 종목 카드에 회사 로고 표시
- 카테고리 자동 분류 (Tech / Finance / Healthcare 등)

**데이터 소스:**
- Yahoo Finance API
- Alpha Vantage API
- Nasdaq Data Link

**구현 계획:**
1. 종목 마스터 DB 테이블 생성 (ticker, name, logo, category)
2. 크롤링 시 자동으로 종목 정보 업데이트
3. UI에서 티커 + 회사명 함께 표시

---

### 2. ETF 보유종목 검색 서비스
**문제점:**
- 투자자들이 ETF 내부 구성을 모르고 투자
- ETF + 개별주 중복 매수로 의도치 않은 집중투자 발생
- 분산투자 실패

**해결책:**
- ETF 자동 포트폴리오 공개 플랫폼
- 사용자가 보유한 ETF + 개별주 입력 시 중복 종목 분석
- 실제 포트폴리오 시각화 (차트)

**핵심 기능:**
1. **ETF 검색**
   - ETF 티커 입력 (예: SPY, QQQ, ARKK)
   - 보유 종목 TOP 10 표시
   - 비중 차트 (파이 차트, 바 차트)

2. **포트폴리오 분석**
   - 사용자가 보유한 ETF + 개별주 입력
   - 실제 종목별 비중 계산
   - 중복 종목 하이라이트
   - 섹터별 분산 분석

3. **데이터 자동화**
   - FactSet, Morningstar 등 유료 API 사용
   - 또는 공개 데이터 (SEC, NASDAQ) 크롤링
   - 주기적 업데이트 (주 1회)

**데이터 소스:**
- FactSet API (유료)
- Morningstar API (유료)
- SEC EDGAR (무료, 분기별 업데이트)
- ETF.com (크롤링 가능)

**구현 계획:**
1. ETF 보유종목 DB 테이블 생성
2. ETF 데이터 수집 스크립트 작성
3. 포트폴리오 분석 알고리즘 구현
4. 시각화 UI 개발 (차트)

---

### 3. 수익화 모델 (AI 리포트 구독)
**현재 플랫폼 구조:**
- 무료: 거래량 상위 티커 보기 + ETF TOP 10 보유종목 + 전문가 영상 링크
- 유료: AI 리포트 제공

**구독 플랜:**

| 플랜 | 월 요금 | 주요 기능 | 타겟 |
|------|---------|-----------|------|
| **Free** | 0원 | 거래량 상위 티커 보기 + ETF TOP 10 보유종목 + 전문가 영상 링크 | 초보 투자자 |
| **Pro** | ₩9,900 | AI 요약 리포트 "오늘의 거래량 급등 종목 알림" + 주간 리포트 PDF 제공 | 중급 투자자 |
| **Premium** | ₩29,000 | 종목/ETF별 AI 해석 + SNS 감정분석 기반 의견 요약 + 맞춤형 이메일 리포트 | 고급 투자자 |

**AI 리포트 내용:**
1. **일간 리포트**
   - 오늘의 거래량 급등 종목 TOP 5
   - 전문가 의견 요약
   - 상승/하락 예측 근거

2. **주간 리포트 (PDF)**
   - 주간 HOT 종목 분석
   - ETF 변화 요약
   - 시장 트렌드 분석

3. **맞춤형 리포트 (Premium)**
   - 사용자가 관심 종목 등록
   - 해당 종목에 대한 전문가 의견 자동 수집
   - 매일 이메일 발송

**무료 모델의 한계:**
- 데이터 제공은 대부분 공개 정보
- 차별화 포인트: 지블 의사(지갑 개방률) 낮음
- 무료 탐색용, 충분. 그러나 수익 전환은 불가

**유료 전환 핵심:**
- 단순 정보가 아닌 **인사이트(해석) + 시간 절약(요약)**
- "오늘 ETF 변화 요약 / 시장 트렌드 / SNS 여론" 같은 형태

**구현 계획:**
1. 구독 시스템 구축 (Stripe 연동)
2. AI 리포트 생성 로직 구현 (LLM 활용)
3. PDF 생성 및 이메일 발송 자동화
4. 사용자 관심 종목 관리 기능

---

## 🚀 우선순위

### Phase 1: 티커 표시 기능 (1주)
- [ ] 종목 마스터 DB 테이블 생성
- [ ] Yahoo Finance API 연동
- [ ] 크롤링 시 종목 정보 자동 수집
- [ ] UI에 티커 + 회사명 표시

### Phase 2: ETF 보유종목 검색 (2주)
- [ ] ETF 보유종목 DB 테이블 생성
- [ ] ETF 데이터 수집 스크립트 작성
- [ ] ETF 검색 UI 개발
- [ ] 포트폴리오 분석 기능 구현
- [ ] 차트 시각화

### Phase 3: 수익화 모델 구축 (2주)
- [ ] 구독 플랜 설계
- [ ] Stripe 결제 연동
- [ ] AI 리포트 생성 로직 구현
- [ ] PDF 생성 및 이메일 발송
- [ ] 사용자 관심 종목 관리

---

## 📊 데이터 아키텍처

### 새로운 DB 테이블

```sql
-- 종목 마스터 테이블
CREATE TABLE stocks (
  ticker VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  category VARCHAR(50), -- Tech, Finance, Healthcare 등
  exchange VARCHAR(20), -- NASDAQ, NYSE 등
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ETF 보유종목 테이블
CREATE TABLE etf_holdings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  etf_ticker VARCHAR(10) NOT NULL,
  stock_ticker VARCHAR(10) NOT NULL,
  weight DECIMAL(5, 2), -- 보유 비중 (%)
  shares BIGINT, -- 보유 주식 수
  market_value BIGINT, -- 시가총액
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (etf_ticker) REFERENCES stocks(ticker),
  FOREIGN KEY (stock_ticker) REFERENCES stocks(ticker)
);

-- 사용자 포트폴리오 테이블
CREATE TABLE user_portfolios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ticker VARCHAR(10) NOT NULL,
  shares INT, -- 보유 주식 수
  is_etf BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (ticker) REFERENCES stocks(ticker)
);

-- 구독 플랜 테이블
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan VARCHAR(20) NOT NULL, -- free, pro, premium
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  stripe_subscription_id VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 사용자 관심 종목 테이블
CREATE TABLE watchlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ticker VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (ticker) REFERENCES stocks(ticker)
);
```

---

## 🎨 UI/UX 개선 사항

### 1. 티커 표시 개선
```
현재: $AAPL
개선: $AAPL (Apple Inc.) 🍎
```

### 2. ETF 검색 페이지
- 검색바: ETF 티커 입력
- 결과: 보유 종목 TOP 10 + 비중 차트
- 포트폴리오 분석: 사용자 보유 종목 입력 → 중복 분석

### 3. 구독 페이지
- Free / Pro / Premium 플랜 비교 테이블
- Stripe 결제 버튼
- 구독 혜택 강조

---

## 📈 성공 지표 (KPI)

### 사용자 지표
- 일간 활성 사용자 (DAU)
- 주간 활성 사용자 (WAU)
- 사용자 유지율 (Retention Rate)

### 수익 지표
- 유료 전환율 (Free → Pro/Premium)
- 월간 반복 수익 (MRR)
- 고객 생애 가치 (LTV)

### 참여 지표
- 평균 세션 시간
- 페이지뷰 (PV)
- ETF 검색 횟수
- 포트폴리오 분석 사용 횟수

---

## 🔧 기술 스택

### 백엔드
- Node.js + Express + tRPC
- MySQL (Drizzle ORM)
- Stripe (결제)
- LLM (AI 리포트 생성)

### 프론트엔드
- React 19
- Tailwind CSS 4
- shadcn/ui
- Chart.js (차트)

### 데이터 수집
- Yahoo Finance API
- Alpha Vantage API
- FactSet / Morningstar (ETF 데이터)
- Twitter / YouTube API

### 인프라
- Vercel (프론트엔드)
- Manus (백엔드)
- S3 (파일 저장)

---

## 📝 다음 단계

1. **Phase 1 시작**: 티커 표시 기능 구현
2. **데이터 소스 확보**: Yahoo Finance API 키 발급
3. **DB 마이그레이션**: 새로운 테이블 생성
4. **UI 디자인**: 티커 + 회사명 표시 디자인

진행하시겠습니까?
