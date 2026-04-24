"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Sparkles, BookOpen, RefreshCcw, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface HotTopicsData {
  trendingTopics: Array<{ name: string; count: number; rising: number; score: number }>;
  stats: { activeUsers: number; totalInteractions: number; trendingUnit: string };
  recentQueries: Array<{ topic: string; time: string }>;
}

export default function HotTopicsPage() {
  const router = useRouter();
  const [data, setData] = useState<HotTopicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleTopicClick = async (topic: string) => {
    const userId = localStorage.getItem("examwise_user_id");
    if (!userId) {
      router.push("/signup");
      return;
    }

    setIsRedirecting(true);
    try {
      // 1. Create a new chat session
      const res = await fetch(`/api/chat/${userId}/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Deep Dive: ${topic}` })
      });
      const chat = await res.json();

      // 2. Redirect to the new chat with the topic param
      router.push(`/chat/${userId}/${chat.id}?topic=${encodeURIComponent(topic)}`);
    } catch (err) {
      console.error("Failed to start topic-specific chat:", err);
      setIsRedirecting(false);
    }
  };

  const fetchHotTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hot-topics?subject=DBMS");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch hot topics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotTopics();
  }, []);

  const getSignalText = (query: any) => {
    const topic = `"${query.topic}"`;
    const templates = {
      chat: [
        `Studying ${topic} fundamentals`,
        `Diving into ${topic} deep-dive`,
        `Exploring ${topic} concepts`,
        `Clarifying doubts on ${topic}`,
        `Mastering ${topic} logic`,
        `Researching ${topic} for exams`
      ],
      strategy: [
        `Building a study plan for ${topic}`,
        `Strategizing ${topic} preparation`,
        `Organizing ${topic} revision`,
        `Creating a roadmap for ${topic}`
      ],
      upload: [
        `Shared ${topic} study material`,
        `New reference for ${topic} uploaded`,
        `Added ${topic} notes to the community`,
        `Contributing ${topic} context`
      ]
    };

    // Use query.time string as a seed for consistent phrasing per event
    const seed = query.time.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    
    let options = templates.chat;
    if (query.action === "upload") options = templates.upload;
    else if (query.queryType === "strategy") options = templates.strategy;

    return options[seed % options.length];
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hot Topics</h1>
          <p className="mt-2 text-muted-foreground">See what other students in your curriculum are focusing on right now.</p>
        </div>
        <button 
          onClick={fetchHotTopics}
          className="p-2 hover:bg-accent rounded-full transition-colors"
          disabled={loading}
        >
          <RefreshCcw className={`h-5 w-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Currently Studying</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">students active in your branch</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trending Focus</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.trendingUnit || "N/A"}</div>
            <p className="text-xs text-muted-foreground">Highest activity topic</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.totalInteractions || 0}</div>
            <p className="text-xs text-muted-foreground">Anonymized interactions today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-500" /> Likely Important Topics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             {data?.trendingTopics && data.trendingTopics.length > 0 ? (
               data.trendingTopics.map((topic, i) => (
                 <div 
                   key={i} 
                   onClick={() => !isRedirecting && handleTopicClick(topic.name)}
                   className={`flex justify-between items-center p-3 rounded-lg border border-border/50 bg-background/50 transition-all group ${isRedirecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50 hover:bg-primary/5'}`}
                 >
                   <div>
                     <p className="font-medium group-hover:text-primary transition-colors">{topic.name}</p>
                     <p className="text-xs text-muted-foreground">{topic.count} conversations started</p>
                   </div>
                   <div className="flex items-center gap-2">
                     {isRedirecting && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                     <Badge variant={i === 0 ? "default" : "secondary"}>
                       {i === 0 ? "🔥 Hot" : topic.rising > 0 ? "📈 Rising" : "Active"}
                     </Badge>
                   </div>
                 </div>
               ))
             ) : (
               <p className="text-sm text-muted-foreground text-center py-8">No trending data yet. Start a chat to generate signals!</p>
             )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Community Signals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             {data?.recentQueries && data.recentQueries.length > 0 ? (
               data.recentQueries.reverse().map((query: any, i) => (
                 <div key={i} className="space-y-2 p-3 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:border-primary/50 transition-colors">
                   <p className="font-medium text-sm">
                     {getSignalText(query)}
                   </p>
                   <p className="text-xs text-muted-foreground flex items-center gap-1">
                     <Users className="h-3 w-3 "/> {new Date(query.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                 </div>
               ))
             ) : (
               <p className="text-sm text-muted-foreground text-center py-8">Waiting for signals...</p>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
