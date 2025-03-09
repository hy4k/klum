import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
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