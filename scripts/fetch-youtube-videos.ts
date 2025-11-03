import { drizzle } from "drizzle-orm/mysql2";
import { influencers, contents } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
}

async function searchYouTubeVideos(influencerName: string): Promise<YouTubeVideo[]> {
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error("Missing API credentials");
  }

  try {
    // YouTube 검색 API 사용
    const searchQuery = `${influencerName} stocks investing`;
    const response = await fetch(`${apiUrl}/v1/data-api/Youtube/search?q=${encodeURIComponent(searchQuery)}&hl=en&gl=US`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to search videos for ${influencerName}: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    const videos: YouTubeVideo[] = [];
    
    if (data.contents && Array.isArray(data.contents)) {
      for (const item of data.contents) {
        if (item.type === 'video' && item.video) {
          const video = item.video;
          
          // publishedTimeText를 실제 날짜로 변환
          let publishedDate = new Date();
          const timeText = video.publishedTimeText || '';
          
          if (timeText.includes('hour')) {
            const hours = parseInt(timeText) || 1;
            publishedDate = new Date(Date.now() - hours * 60 * 60 * 1000);
          } else if (timeText.includes('day')) {
            const days = parseInt(timeText) || 1;
            publishedDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          } else if (timeText.includes('week')) {
            const weeks = parseInt(timeText) || 1;
            publishedDate = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);
          } else if (timeText.includes('month')) {
            const months = parseInt(timeText) || 1;
            publishedDate = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);
          } else if (timeText.includes('year')) {
            const years = parseInt(timeText) || 1;
            publishedDate = new Date(Date.now() - years * 365 * 24 * 60 * 60 * 1000);
          }
          
          // 1주일 이내 영상만 수집
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          if (publishedDate < oneWeekAgo) {
            continue;
          }
          
          videos.push({
            id: video.videoId,
            title: video.title || '',
            description: video.descriptionSnippet || '',
            publishedAt: publishedDate.toISOString(),
            thumbnailUrl: video.thumbnails?.[0]?.url || '',
            viewCount: 0, // 검색 API에서는 조회수 제공 안됨
          });
        }
      }
    }

    return videos.slice(0, 7); // 최대 7개
  } catch (error) {
    console.error(`Error searching videos for ${influencerName}:`, error);
    return [];
  }
}

async function main() {
  console.log("Starting YouTube video collection via Search API...");

  // YouTube 인플루언서 가져오기
  const youtubeInfluencers = await db
    .select()
    .from(influencers)
    .where(eq(influencers.platform, "youtube"));

  console.log(`Found ${youtubeInfluencers.length} YouTube influencers`);

  let totalVideos = 0;

  for (const influencer of youtubeInfluencers) {
    console.log(`\nSearching videos for ${influencer.name}...`);

    const videos = await searchYouTubeVideos(influencer.name);

    console.log(`  Found ${videos.length} recent videos (within 1 week)`);

    for (const video of videos) {
      try {
        // 중복 체크
        const existing = await db
          .select()
          .from(contents)
          .where(eq(contents.platformContentId, video.id))
          .limit(1);

        if (existing.length > 0) {
          console.log(`  ⏭️  Video already exists: ${video.title.substring(0, 50)}...`);
          continue;
        }

        // 영상 저장
        await db.insert(contents).values({
          influencerId: influencer.id,
          platform: "youtube",
          contentType: "video",
          title: video.title,
          description: video.description,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          thumbnailUrl: video.thumbnailUrl,
          platformContentId: video.id,
          publishedAt: new Date(video.publishedAt),
          viewCount: video.viewCount,
          likeCount: 0,
          commentCount: 0,
        });

        console.log(`  ✅ Saved: ${video.title.substring(0, 50)}...`);
        totalVideos++;
      } catch (error) {
        console.error(`  ❌ Error saving video:`, error);
      }
    }

    // API rate limit 방지
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ Collection complete! Total videos saved: ${totalVideos}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
