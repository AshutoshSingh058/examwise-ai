import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { ChatService } from '@/lib/ai/chat-service';
import { getAIModel, isAIConfigured } from '@/lib/ai/gemini';
import { AI_MODELS } from '@/lib/ai/config';

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

    // 2. Generate AI Metadata Header
    let metadataHeader = "";
    if (isAIConfigured()) {
      try {
        const model = getAIModel({ model: AI_MODELS.EXTRACTION });
        const prompt = `
          Analyze the following YouTube video transcript and generate a structured metadata header in English.
          If the transcript is in a language other than English (e.g., Hindi), translate the summary and key terms to English.
          
          Format your response EXACTLY like this:
          --- AI METADATA HEADER ---
          SUMMARY: (2-3 sentences in English)
          KEY TERMS: (comma separated list)
          SUBJECT TAGS: (appropriate academic subjects)
          LIKELY EXAM TOPICS: (what is important for a student?)
          LANGUAGE DETECTED: (Original language of the transcript)
          --- END HEADER ---

          TRANSCRIPT:
          ${fullText.substring(0, 15000)} // Limit to stay within context
        `;

        const result = await model.generateContent(prompt);
        metadataHeader = result.response.text();
      } catch (aiError) {
        console.error("AI Metadata Generation Error:", aiError);
        metadataHeader = "--- AI METADATA ERROR ---\nFailed to generate summary.\n--- END HEADER ---";
      }
    }

    // 3. Combine Header and Body
    const finalContent = `${metadataHeader}\n\n--- ORIGINAL TRANSCRIPT ---\n\n${fullText}`;

    return NextResponse.json({
      title: `YouTube Video (${videoId})`,
      content: finalContent,
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
