import { drizzle } from 'drizzle-orm/mysql2';
import * as fs from 'fs';

async function migrate() {
  const db = drizzle(process.env.DATABASE_URL!);
  const sql = fs.readFileSync('drizzle/0004_nappy_vapor.sql', 'utf-8');

  try {
    await db.execute(sql);
    console.log('✅ Migration 0004 applied successfully');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
  }
  process.exit(0);
}

migrate();
