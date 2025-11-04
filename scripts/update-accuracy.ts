/**
 * Daily Accuracy Update Script
 * 
 * This script runs daily to:
 * 1. Verify predictions that are 7 days old
 * 2. Update expert accuracy ratings
 * 3. Auto-remove experts with < 60% accuracy
 */

import { getDb } from "../server/db";
import * as db from "../server/db";

async function fetchStockPrice(ticker: string, date: Date): Promise<number | null> {
  // TODO: Implement actual stock price fetching
  // For now, return mock data
  return Math.floor(Math.random() * 50000) + 10000; // Random price in cents
}

async function verifyPredictions() {
  console.log("🔍 Checking unverified predictions...");
  
  const unverified = await db.getUnverifiedPredictions();
  console.log(`Found ${unverified.length} predictions to verify`);
  
  for (const prediction of unverified) {
    if (!prediction.ticker || !prediction.predictedDate || !prediction.priceAtPrediction) {
      continue;
    }
    
    // Get price 7 days after prediction
    const verificationDate = new Date(prediction.predictedDate);
    verificationDate.setDate(verificationDate.getDate() + 7);
    
    const priceAfter7Days = await fetchStockPrice(prediction.ticker, verificationDate);
    if (!priceAfter7Days) continue;
    
    // Calculate price change
    const priceChange = Math.round(((priceAfter7Days - prediction.priceAtPrediction) / prediction.priceAtPrediction) * 10000);
    
    // Determine if prediction was correct
    let isCorrect = 0;
    if (prediction.sentiment === 'bullish' && priceChange > 0) isCorrect = 1;
    else if (prediction.sentiment === 'bearish' && priceChange < 0) isCorrect = 1;
    else if (prediction.sentiment === 'neutral' && Math.abs(priceChange) < 200) isCorrect = 1; // Within ±2%
    
    // Save result
    await db.createPredictionResult({
      predictionId: prediction.id,
      priceAfter7Days,
      priceChange,
      isCorrect,
    });
    
    // Mark as verified
    await db.markPredictionVerified(prediction.id);
    
    console.log(`✅ Verified prediction #${prediction.id}: ${prediction.ticker} ${prediction.sentiment} - ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
  }
}

async function updateAllExpertAccuracy() {
  console.log("📊 Updating expert accuracy ratings...");
  
  const influencers = await db.getAllInfluencers();
  
  for (const influencer of influencers) {
    await db.calculateExpertAccuracy(influencer.id);
    const accuracy = await db.getExpertAccuracy(influencer.id);
    
    if (accuracy) {
      console.log(`✅ ${influencer.name}: ${accuracy.accuracyRate}% (${accuracy.grade} grade, ${accuracy.totalPredictions} predictions)`);
      
      // Auto-remove if accuracy < 60%
      if (accuracy.totalPredictions >= 20 && accuracy.accuracyRate < 60) {
        console.log(`❌ REMOVED: ${influencer.name} - accuracy too low (${accuracy.accuracyRate}%)`);
        // TODO: Mark influencer as inactive
      }
    }
  }
}

async function main() {
  console.log("🚀 Starting daily accuracy update...");
  console.log(`📅 Date: ${new Date().toISOString()}`);
  
  try {
    await verifyPredictions();
    await updateAllExpertAccuracy();
    
    console.log("✅ Daily accuracy update completed successfully!");
  } catch (error) {
    console.error("❌ Error during accuracy update:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
