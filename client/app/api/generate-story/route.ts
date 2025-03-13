import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  sender: string;
  content: string;
  character?: string;
  timestamp: any;
  sessionToken: string;
  era?: string;
}

interface Session {
  active: boolean;
  code: string;
  startedAt: Date;
  lastActivity: Date;
}

export async function POST(request: Request) {
  try {
    const { messages, era, userCharacter, klumCharacter, sessionToken } = await request.json();

    if (!messages || !era || !userCharacter || !klumCharacter || !sessionToken) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required parameters" 
      }, { status: 400 });
    }

    // Validate session
    const sessionRef = db.collection("sessions").doc(sessionToken);
    const sessionSnapshot = await sessionRef.get();
    const sessionData = sessionSnapshot.data() as Session | undefined;
    
    if (!sessionSnapshot.exists || !sessionData?.active) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid or inactive session" 
      }, { status: 401 });
    }

    // Format messages for the AI prompt
    const conversationText = messages
      .map((msg: Message) => `${msg.character || msg.sender}: ${msg.content}`)
      .join('\n');

    // Create the prompt for OpenAI
    const prompt = `
      You are a creative storyteller specializing in historical fiction.
      
      Create a captivating short story based on the following conversation that took place in a time travel roleplay set in "${era}".
      
      The conversation was between:
      - ${userCharacter}
      - ${klumCharacter}
      
      Here's their conversation:
      
      ${conversationText}
      
      Based on this conversation, create a vivid historical tale (about 300-500 words) that:
      1. Incorporates both characters
      2. Is historically accurate to the ${era} period
      3. Weaves their conversation into a coherent narrative
      4. Has a clear beginning, middle, and end
      5. Includes sensory details and setting descriptions
      6. Feels like it could have actually happened in history
      
      Write the story in third person perspective, as if it were a historical account discovered years later.
    `;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a creative historical fiction writer who specializes in creating vivid, accurate stories based on time periods.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to generate story" 
      }, { status: 500 });
    }

    const story = data.choices[0].message.content.trim();

    // Store the story in Firestore
    const storyId = uuidv4();
    await db.collection('timeTravel').doc(storyId).set({
      story,
      era,
      userCharacter,
      klumCharacter,
      sessionToken,
      timestamp: new Date(),
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      story 
    });
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error" 
    }, { status: 500 });
  }
}
