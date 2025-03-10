import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Check if we're running in a server environment or build time
const isServer = typeof window === 'undefined';
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Initialize OpenAI client conditionally
const openai = (!isBuildTime && isServer && process.env.OPENAI_API_KEY) 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: Request) {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      console.warn('OpenAI client not initialized. This would be an error in production.');
      return NextResponse.json({ story: 'Story generation not available' });
    }

    const { messages, era, year } = await request.json();

    // Extract conversation context
    const conversationContext = messages
      .map((msg: any) => `${msg.character || msg.sender}: ${msg.content}`)
      .join('\n');

    // Generate alternative history story
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a creative storyteller specializing in alternative history narratives. 
                   Based on the following conversation taking place in ${era} (Year: ${year}), 
                   create a compelling "What If" scenario that explores an alternative historical outcome. 
                   Make it dramatic, historically plausible, and engaging.`
        },
        {
          role: "user",
          content: `Conversation:\n${conversationContext}\n\nCreate a "What If" alternative history story based on this conversation.`
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const story = completion.choices[0]?.message?.content || 'Failed to generate story';
    return NextResponse.json({ story });
  } catch (error) {
    console.error('Story Generation API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}