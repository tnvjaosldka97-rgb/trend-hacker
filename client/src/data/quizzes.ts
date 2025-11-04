export interface Quiz {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  category: string;
}

export const INVESTMENT_QUIZZES: Quiz[] = [
  { id: 1, question: "5년 후 더 높은 수익률을 기록할 종목은?", optionA: "테슬라", optionB: "삼성전자", category: "tech" },
  { id: 2, question: "AI 시대의 최대 수혜주는?", optionA: "엔비디아", optionB: "AMD", category: "ai" },
  { id: 3, question: "클라우드 시장의 승자는?", optionA: "아마존", optionB: "마이크로소프트", category: "cloud" },
  { id: 4, question: "전기차 시장의 미래는?", optionA: "테슬라", optionB: "리비안", category: "ev" },
  { id: 5, question: "메타버스 투자 대상은?", optionA: "메타", optionB: "로블록스", category: "metaverse" },
  { id: 6, question: "반도체 장기 투자 종목은?", optionA: "TSMC", optionB: "인텔", category: "semiconductor" },
  { id: 7, question: "스트리밍 전쟁의 승자는?", optionA: "넷플릭스", optionB: "디즈니", category: "streaming" },
  { id: 8, question: "결제 시스템의 미래는?", optionA: "비자", optionB: "페이팔", category: "fintech" },
  { id: 9, question: "소셜미디어 투자처는?", optionA: "메타", optionB: "스냅", category: "social" },
  { id: 10, question: "게임 산업 투자는?", optionA: "마이크로소프트", optionB: "소니", category: "gaming" },
  { id: 11, question: "배터리 기술의 승자는?", optionA: "테슬라", optionB: "LG에너지솔루션", category: "battery" },
  { id: 12, question: "우주 산업 투자는?", optionA: "스페이스X", optionB: "블루오리진", category: "space" },
  { id: 13, question: "헬스케어 혁신 기업은?", optionA: "테라닥", optionB: "모더나", category: "healthcare" },
  { id: 14, question: "전자상거래 투자는?", optionA: "아마존", optionB: "쇼피파이", category: "ecommerce" },
  { id: 15, question: "자율주행 기술 선두는?", optionA: "웨이모", optionB: "테슬라", category: "autonomous" },
  { id: 16, question: "5G 인프라 투자는?", optionA: "퀄컴", optionB: "에릭슨", category: "5g" },
  { id: 17, question: "로보틱스 투자처는?", optionA: "ABB", optionB: "화낙", category: "robotics" },
  { id: 18, question: "사이버보안 투자는?", optionA: "크라우드스트라이크", optionB: "팔로알토", category: "security" },
  { id: 19, question: "클린에너지 투자는?", optionA: "넥스트에라", optionB: "엔페이즈", category: "clean" },
  { id: 20, question: "식품 배달 플랫폼은?", optionA: "도어대시", optionB: "우버이츠", category: "delivery" },
  { id: 21, question: "항공우주 투자는?", optionA: "보잉", optionB: "록히드마틴", category: "aerospace" },
  { id: 22, question: "바이오테크 투자는?", optionA: "모더나", optionB: "일루미나", category: "biotech" },
  { id: 23, question: "반도체 장비 투자는?", optionA: "ASML", optionB: "어플라이드머티리얼즈", category: "equipment" },
  { id: 24, question: "데이터센터 투자는?", optionA: "에퀴닉스", optionB: "디지털리얼티", category: "datacenter" },
  { id: 25, question: "광고 플랫폼 투자는?", optionA: "구글", optionB: "메타", category: "advertising" },
  { id: 26, question: "음악 스트리밍은?", optionA: "스포티파이", optionB: "애플뮤직", category: "music" },
  { id: 27, question: "커피 체인 투자는?", optionA: "스타벅스", optionB: "던킨", category: "food" },
  { id: 28, question: "럭셔리 브랜드는?", optionA: "LVMH", optionB: "에르메스", category: "luxury" },
  { id: 29, question: "ETF 장기 투자는?", optionA: "SPY", optionB: "QQQ", category: "etf" },
  { id: 30, question: "금융 플랫폼 투자는?", optionA: "로빈후드", optionB: "코인베이스", category: "finance" },
];

/**
 * 랜덤으로 3개 퀴즈 선택
 */
export function getRandomQuizzes(count: number = 3): Quiz[] {
  const shuffled = [...INVESTMENT_QUIZZES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
