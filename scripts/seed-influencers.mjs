import { drizzle } from "drizzle-orm/mysql2";
import { influencers } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const influencersData = [
  // YouTube Influencers (10)
  { name: "Graham Stephan", platform: "youtube", handle: "@GrahamStephan", specialty: "부동산, 밸류 투자", followerCount: 4800000 },
  { name: "Andrei Jikh", platform: "youtube", handle: "@AndreiJikh", specialty: "암호화폐, 테크 주식", followerCount: 2300000 },
  { name: "Meet Kevin", platform: "youtube", handle: "@MeetKevin", specialty: "실시간 시장 분석", followerCount: 1900000 },
  { name: "Jeremy Lefebvre", platform: "youtube", handle: "@FinancialEducation", specialty: "성장주 분석, 트레이딩", followerCount: 1700000 },
  { name: "Invest with Alex", platform: "youtube", handle: "@InvestwithAlex", specialty: "옵션, 레버리지 전략", followerCount: 1500000 },
  { name: "ZipTrader", platform: "youtube", handle: "@ZipTrader", specialty: "기술적 분석, 차트패턴", followerCount: 1200000 },
  { name: "Rayner Teo", platform: "youtube", handle: "@RaynerTeo", specialty: "트레이딩 심리, 스윙매매", followerCount: 950000 },
  { name: "Humbled Trader", platform: "youtube", handle: "@HumbledTrader", specialty: "실전 트레이딩, 루틴공개", followerCount: 780000 },
  { name: "Patrick Boyle", platform: "youtube", handle: "@PatrickBoyleOnFinance", specialty: "매크로 전략, 헤지펀드 통찰", followerCount: 650000 },
  { name: "HaeRim Trading", platform: "youtube", handle: "@HaeRimTrading", specialty: "K-트레이딩, 한국 전략", followerCount: 520000 },
  
  // Twitter Influencers - Trading (10)
  { name: "Steve Burns", platform: "twitter", handle: "@sjosephburns", specialty: "Macro Trading", followerCount: 634000 },
  { name: "Michael J. Huddleston", platform: "twitter", handle: "@I_Am_The_ICT", specialty: "Macro Trading", followerCount: 609000 },
  { name: "Timothy Sykes", platform: "twitter", handle: "@timothysykes", specialty: "Day Trading", followerCount: 326000 },
  { name: "Trey Collins", platform: "twitter", handle: "@TreyCollins_", specialty: "Technical Analysis", followerCount: 237000 },
  { name: "Gareth Soloway", platform: "twitter", handle: "@GarethSoloway", specialty: "Technical Analysis", followerCount: 227000 },
  { name: "Umar Ashraf", platform: "twitter", handle: "@umar_ashraf_", specialty: "Crypto & Stocks", followerCount: 176000 },
  { name: "Real JG Banks", platform: "twitter", handle: "@RealJGBanks", specialty: "Day Trading", followerCount: 155000 },
  { name: "Shinobi", platform: "twitter", handle: "@BTC_Shinobi", specialty: "Crypto Trading", followerCount: 129000 },
  { name: "Kathy Lien", platform: "twitter", handle: "@KathyLien", specialty: "Forex & Markets", followerCount: 124000 },
  { name: "Mike", platform: "twitter", handle: "@MikeTradess", specialty: "Swing Trading", followerCount: 95000 },
  
  // Twitter Influencers - Investing (10)
  { name: "Brian Feroldi", platform: "twitter", handle: "@BrianFeroldi", specialty: "투자 교육", followerCount: 573000 },
  { name: "Morgan Housel", platform: "twitter", handle: "@morganhousel", specialty: "투자 심리, 재무 철학", followerCount: 567000 },
  { name: "Liz Ann Sonders", platform: "twitter", handle: "@LizAnnSonders", specialty: "시장 분석", followerCount: 453000 },
  { name: "Andrew Lokenauth", platform: "twitter", handle: "@fluentinfinance", specialty: "금융 교육", followerCount: 352000 },
  { name: "Ben Carlson", platform: "twitter", handle: "@awealthofcs", specialty: "자산 관리", followerCount: 280000 },
  { name: "Kenny", platform: "twitter", handle: "@accentinvesting", specialty: "가치 투자", followerCount: 266000 },
  { name: "Ian Cassel", platform: "twitter", handle: "@iancassel", specialty: "마이크로캡 투자", followerCount: 261000 },
  { name: "Graham Stephan (Twitter)", platform: "twitter", handle: "@grahamstephan", specialty: "부동산, 투자", followerCount: 196000 },
  { name: "Michael Batnick", platform: "twitter", handle: "@michaelbatnick", specialty: "시장 분석", followerCount: 192000 },
  { name: "Tadas Viskanta", platform: "twitter", handle: "@abnormalreturns", specialty: "투자 뉴스 큐레이션", followerCount: 118000 },
];

async function main() {
  console.log("Seeding influencers...");
  
  for (const influencer of influencersData) {
    await db.insert(influencers).values(influencer);
  }
  
  console.log(`Successfully seeded ${influencersData.length} influencers!`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding influencers:", err);
  process.exit(1);
});
