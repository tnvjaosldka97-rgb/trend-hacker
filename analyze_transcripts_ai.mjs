#!/usr/bin/env node
/**
 * AI 자막 분석 스크립트
 * - 핵심 내용 요약
 * - 언급된 종목 추출
 * - 전망 분석 (상승/하락/중립)
 */

import mysql from 'mysql2/promise';

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL || 'https://api.manus.im';
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY || '';

async function callLLM(messages) {
  const url = `${FORGE_API_URL}/v1/chat/completions`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FORGE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'transcript_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              summary: {
                type: 'string',
                description: '핵심 내용 요약 (2-3문장)'
              },
              stocks: {
                type: 'array',
                description: '언급된 종목 티커 목록',
                items: { type: 'string' }
              },
              sentiment: {
                type: 'string',
                description: '전반적인 전망',
                enum: ['bullish', 'bearish', 'neutral']
              },
              key_points: {
                type: 'array',
                description: '주요 포인트 (3-5개)',
                items: { type: 'string' }
              }
            },
            required: ['summary', 'stocks', 'sentiment', 'key_points'],
            additionalProperties: false
          }
        }
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`LLM API error: ${response.statusText}`);
  }
  
  const result = await response.json();
  const content = result.choices[0].message.content;
  return JSON.parse(content);
}

async function analyzeTranscript(title, transcript) {
  const messages = [
    {
      role: 'system',
      content: `You are a financial analyst specializing in stock market content analysis. 
Analyze YouTube video transcripts and extract:
1. Summary: 2-3 sentence summary in Korean
2. Stocks: List of stock tickers mentioned (e.g., TSLA, NVDA, AAPL)
3. Sentiment: Overall market sentiment (bullish/bearish/neutral)
4. Key Points: 3-5 key takeaways in Korean

Be precise and focus on actionable insights.`
    },
    {
      role: 'user',
      content: `Title: ${title}

Transcript:
${transcript.substring(0, 4000)}

Analyze this video content and provide structured output.`
    }
  ];
  
  return await callLLM(messages);
}

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // 자막이 있는 콘텐츠 조회
  const [contents] = await connection.execute(`
    SELECT id, title, transcript 
    FROM contents 
    WHERE transcript IS NOT NULL 
    AND transcript != ''
    AND aiSummary IS NULL
    LIMIT 20
  `);
  
  console.log(`\n분석할 콘텐츠: ${contents.length}개\n`);
  
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i];
    console.log(`[${i+1}/${contents.length}] 분석 중: ${content.title.substring(0, 60)}...`);
    
    try {
      // AI 분석
      const analysis = await analyzeTranscript(content.title, content.transcript);
      
      // DB 업데이트
      await connection.execute(`
        UPDATE contents 
        SET aiSummary = ?,
            aiStocks = ?,
            aiSentiment = ?,
            aiKeyPoints = ?
        WHERE id = ?
      `, [
        analysis.summary,
        JSON.stringify(analysis.stocks),
        analysis.sentiment,
        JSON.stringify(analysis.key_points),
        content.id
      ]);
      
      console.log(`  ✓ 요약: ${analysis.summary.substring(0, 80)}...`);
      console.log(`  ✓ 종목: ${analysis.stocks.slice(0, 5).join(', ')}`);
      console.log(`  ✓ 전망: ${analysis.sentiment}`);
      console.log();
      
    } catch (error) {
      console.log(`  ✗ 오류: ${error.message}`);
      continue;
    }
  }
  
  await connection.end();
  console.log(`\n✓ AI 분석 완료: ${contents.length}개`);
}

main().catch(console.error);
