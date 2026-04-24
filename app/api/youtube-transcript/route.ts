import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Extract Video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Fetch Transcript
    const transcriptConfig = await YoutubeTranscript.fetchTranscript(videoId);
    
    // Combine text
    const fullText = transcriptConfig.map(part => part.text).join(' ');

    return NextResponse.json({
      title: `YouTube Video (${videoId})`, // We can improve this by fetching the page title if needed
      content: fullText,
      sourceUrl: url,
      type: 'youtube'
    });
  } catch (error: any) {
    console.error('YouTube Transcript Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch transcript. Ensure the video has captions enabled.',
      details: error.message 
    }, { status: 500 });
  }
}

function extractVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
