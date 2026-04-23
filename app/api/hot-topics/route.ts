import { NextResponse } from "next/server"
import { getActivities, ActivityEvent } from "@/lib/activity-db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectFilter = searchParams.get("subject");
    const courseFilter = searchParams.get("course");

    const activities = await getActivities();

    // 1. Filter by subject/course if specified
    let filtered = activities;
    if (subjectFilter) {
      filtered = filtered.filter(a => a.subject.toLowerCase() === subjectFilter.toLowerCase());
    }
    if (courseFilter) {
      filtered = filtered.filter(a => a.course.toLowerCase() === courseFilter.toLowerCase());
    }

    // 2. Aggregate Topics (Topic -> Count)
    const topicCounts: Record<string, number> = {};
    const risingCounts: Record<string, number> = {};
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).getTime();

    filtered.forEach(a => {
      if (a.topic === "General") return; // Skip general bucket for trending
      
      topicCounts[a.topic] = (topicCounts[a.topic] || 0) + 1;
      
      // Calculate rising (last 24 hours)
      if (new Date(a.time).getTime() > oneDayAgo) {
        risingCounts[a.topic] = (risingCounts[a.topic] || 0) + 1;
      }
    });

    // 3. Format Trending Topics
    const trendingTopics = Object.entries(topicCounts)
      .map(([name, count]) => ({
        name,
        count,
        rising: risingCounts[name] || 0,
        score: count + (risingCounts[name] || 0) * 3 // Weighted score: Recent counts are 3x more important
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // 4. Statistics
    const activeUsers = new Set(filtered.map(a => a.userId)).size;
    const totalInteractions = filtered.length;

    // 5. Common Doubts (Recent interactions for topics)
    const recentQueries = filtered
      .slice(-10)
      .map(a => ({
        topic: a.topic,
        action: a.action,
        time: a.time
      }));

    return NextResponse.json({
      trendingTopics,
      stats: {
        activeUsers,
        totalInteractions,
        trendingUnit: trendingTopics[0]?.name || "N/A"
      },
      recentQueries
    });
  } catch (error) {
    console.error("Hot Topics API Error:", error);
    return NextResponse.json({ error: "Failed to aggregate hot topics" }, { status: 500 });
  }
}
