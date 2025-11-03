#!/usr/bin/env tsx
/**
 * Extract YouTube captions using RapidAPI YouTube Captions and Transcripts API
 * 
 * This script:
 * 1. Finds all YouTube videos without transcripts
 * 2. Calls RapidAPI to extract captions
 * 3. Updates the database with extracted transcripts
 * 
 * Free tier: 100 requests/month
 */

import { getContentsWithoutTranscripts, updateContentTranscript } from '../server/db';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'youtube-captions-and-transcripts.p.rapidapi.com';

if (!RAPIDAPI_KEY) {
  console.error('❌ RAPIDAPI_KEY environment variable is not set');
  process.exit(1);
}

interface CaptionResponse {
  data?: {
    text?: string;
    json?: Array<{
      text: string;
      start: number;
      duration: number;
    }>;
  };
  error?: string;
  message?: string;
}

/**
 * Extract captions from a YouTube video using RapidAPI
 */
async function extractCaptions(videoId: string): Promise<string | null> {
  const url = `https://${RAPIDAPI_HOST}/getCaptions?videoId=${videoId}&lang=en&format=text`;
  
  try {
    console.log(`📥 Fetching captions for video: ${videoId}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY!,
      },
    });

    if (!response.ok) {
      console.warn(`⚠️  API returned status ${response.status} for video ${videoId}`);
      return null;
    }

    const data: CaptionResponse = await response.json();
    
    // Check for errors in response
    if (data.error || data.message) {
      console.warn(`⚠️  API error for video ${videoId}: ${data.error || data.message}`);
      return null;
    }

    // Extract text from response
    if (data.data?.text) {
      console.log(`✅ Successfully extracted captions for video ${videoId}`);
      return data.data.text;
    }

    console.warn(`⚠️  No captions found for video ${videoId}`);
    return null;
  } catch (error) {
    console.error(`❌ Error extracting captions for video ${videoId}:`, error);
    return null;
  }
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    // Handle youtube.com format
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Main function to extract captions for all videos without transcripts
 */
async function main() {
  console.log('🚀 Starting caption extraction...\n');
  
  // Get all contents without transcripts
  const contents = await getContentsWithoutTranscripts(100);
  
  console.log(`📊 Found ${contents.length} videos without transcripts\n`);
  
  if (contents.length === 0) {
    console.log('✅ All videos already have transcripts!');
    return;
  }

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < contents.length; i++) {
    const content = contents[i];
    
    console.log(`\n[${i + 1}/${contents.length}] Processing: ${content.title}`);
    console.log(`URL: ${content.url}`);
    
    // Extract video ID from URL
    const videoId = extractVideoId(content.url);
    
    if (!videoId) {
      console.warn(`⚠️  Could not extract video ID from URL: ${content.url}`);
      skippedCount++;
      continue;
    }
    
    // Extract captions
    const transcript = await extractCaptions(videoId);
    
    if (transcript) {
      // Update database
      await updateContentTranscript(content.id, transcript);
      console.log(`💾 Saved transcript to database (${transcript.length} characters)`);
      successCount++;
    } else {
      console.log(`❌ Failed to extract captions`);
      failCount++;
    }
    
    // Rate limiting: wait 1 second between requests
    if (i < contents.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Caption Extraction Summary');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`📝 Total: ${contents.length}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
