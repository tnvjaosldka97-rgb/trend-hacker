import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

const migration = `
CREATE TABLE IF NOT EXISTS \`etfHoldings\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`etfTicker\` varchar(10) NOT NULL,
  \`stockTicker\` varchar(10) NOT NULL,
  \`weight\` int NOT NULL,
  \`shares\` int,
  \`marketValue\` int,
  \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`etfHoldings_id\` PRIMARY KEY(\`id\`)
);

CREATE TABLE IF NOT EXISTS \`stocks\` (
  \`ticker\` varchar(10) NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`logoUrl\` text,
  \`category\` varchar(50),
  \`exchange\` varchar(20),
  \`description\` text,
  \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`stocks_ticker\` PRIMARY KEY(\`ticker\`)
);

CREATE TABLE IF NOT EXISTS \`subscriptions\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`userId\` int NOT NULL,
  \`plan\` enum('free','pro','premium') NOT NULL DEFAULT 'free',
  \`status\` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
  \`startedAt\` timestamp NOT NULL DEFAULT (now()),
  \`expiresAt\` timestamp,
  \`stripeSubscriptionId\` varchar(100),
  \`stripeCustomerId\` varchar(100),
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`subscriptions_id\` PRIMARY KEY(\`id\`)
);

CREATE TABLE IF NOT EXISTS \`userPortfolios\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`userId\` int NOT NULL,
  \`ticker\` varchar(10) NOT NULL,
  \`shares\` int,
  \`isEtf\` int NOT NULL DEFAULT 0,
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT \`userPortfolios_id\` PRIMARY KEY(\`id\`)
);

CREATE TABLE IF NOT EXISTS \`watchlists\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`userId\` int NOT NULL,
  \`ticker\` varchar(10) NOT NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT \`watchlists_id\` PRIMARY KEY(\`id\`)
);
`;

const statements = migration.split(';').filter(s => s.trim());
for (const stmt of statements) {
  if (stmt.trim()) {
    await db.execute(sql.raw(stmt));
  }
}

console.log('✅ Migration completed successfully');
process.exit(0);
