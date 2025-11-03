#!/usr/bin/env tsx
/**
 * Test Twitter data collection with 5 influencers
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { callDataApi } from '../server/_core/dataApi';

interface Influencer {
  username: string;
  name: string;
  category: string;
}

async function testCollection() {
  console.log('🧪 Testing Twitter data collection...\n');
  
  const filePath = join(process.cwd(), 'data', 'twitter-influencers-test.json');
  const data = readFileSync(filePath, 'utf-8');
  const influencers: Influencer[] = JSON.parse(data);
  
  console.log(`📋 Testing with ${influencers.length} influencers\n`);
  
  for (const inf of influencers) {
    console.log(`\n📱 Testing @${inf.username} (${inf.name})...`);
    
    try {
      // Test profile fetch
      console.log('  1️⃣ Fetching profile...');
      const profile = await callDataApi('Twitter/get_user_profile_by_username', {
        query: { username: inf.username }
      });
      
      if (!profile || !profile.result) {
        console.log('  ❌ No profile data');
        continue;
      }
      
      const userData = profile.result?.data?.user?.result;
      if (!userData) {
        console.log('  ❌ Invalid profile structure');
        continue;
      }
      
      const legacy = userData.legacy;
      const followers = legacy?.followers_count || 0;
      const verified = legacy?.verified || userData.is_blue_verified || false;
      
      console.log(`  ✅ Profile OK: ${followers.toLocaleString()} followers, Verified: ${verified}`);
      
      // Test tweets fetch
      console.log('  2️⃣ Fetching tweets...');
      const userId = userData.rest_id;
      
      const tweetsData = await callDataApi('Twitter/get_user_tweets', {
        query: {
          user: userId,
          count: '5'
        }
      });
      
      if (!tweetsData || !tweetsData.result) {
        console.log('  ❌ No tweets data');
        continue;
      }
      
      // Parse tweets
      let tweetCount = 0;
      const timeline = tweetsData.result.timeline;
      if (timeline?.instructions) {
        for (const instruction of timeline.instructions) {
          if (instruction.type === 'TimelineAddEntries') {
            for (const entry of instruction.entries || []) {
              if (entry.entryId?.startsWith('tweet-')) {
                const tweetResult = entry.content?.itemContent?.tweet_results?.result;
                if (tweetResult) {
                  tweetCount++;
                  const text = tweetResult.legacy?.full_text || '';
                  console.log(`  📝 Tweet ${tweetCount}: "${text.slice(0, 60)}..."`);
                }
              }
            }
          }
        }
      }
      
      console.log(`  ✅ Found ${tweetCount} tweets`);
      
    } catch (error) {
      console.error(`  ❌ Error: ${error}`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed!');
  console.log('='.repeat(60));
}

testCollection().catch(console.error);
