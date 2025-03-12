import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
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
      return NextResponse.json({ response: 'OpenAI API not available' });
    }

    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Firebase token using type assertion to ensure TypeScript accepts it
    const decodedToken = await (auth as any).verifyIdToken(token);
    const { content, era, year, context } = await request.json();

    // Generate AI response based on historical context
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are KLUM, a time-traveling AI companion. You are currently in ${era} (Year: ${year}). 
                   Use historical context and facts from this era to make the conversation immersive and authentic. 
                   Historical Context: ${context}`
        },
        { role: "user", content }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}