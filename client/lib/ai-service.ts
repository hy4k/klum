import OpenAI from "openai";
import type { Message as HookMessage } from "@/lib/hooks/useMessages";

// Check if we're running in a browser/build environment
const isBrowser = typeof window !== 'undefined';
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Initialize OpenAI client conditionally
const openai = (!isBuildTime && process.env.NEXT_PUBLIC_AI_API_KEY) 
  ? new OpenAI({ apiKey: process.env.NEXT_PUBLIC_AI_API_KEY })
  : null;

interface Message {
  role: string;
  content: string;
  name?: string;
}

interface GenerateStoryParams {
  era: string;
  characters: string[];
  messages: HookMessage[];
}

export async function generateAIStory({ era, characters, messages }: GenerateStoryParams): Promise<string> {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      console.warn('OpenAI client not initialized');
      return "Story generation temporarily unavailable";
    }

    // Convert HookMessage to the format needed for OpenAI
    const convertedMessages = messages.map(m => ({
      role: m.sender === 'ai' ? 'assistant' : 'user',
      content: m.content,
      name: m.sender
    }));

    const prompt = `
      Create a historical fiction story based on the following:
      Era: ${era}
      Characters: ${characters.join(", ")}
      Recent conversation:
      ${convertedMessages.map((m) => `${m.name || m.role}: ${m.content}`).join("\n")}
      Write a compelling, detailed story (300-500 words) that reimagines this conversation as a historical event.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: "You are a master historical fiction writer." }, { role: "user", content: prompt }],
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content || "An error occurred while generating the story.";
  } catch (error) {
    console.error("Error generating AI story:", error);
    return "The ancient scrolls containing this story have been damaged...";
  }
}

interface GenerateImageParams {
  era: string;
  characters: string[];
  scene: string;
}

export async function generateAIImage({ era, characters, scene }: GenerateImageParams): Promise<string> {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      console.warn('OpenAI client not initialized');
      return "";
    }

    const prompt = `Create a historically accurate image set in ${era} featuring ${characters.join(" and ")} in the following scene: ${scene}.`;

    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0]?.url || "";
  } catch (error) {
    console.error("Error generating AI image:", error);
    return "";
  }
}

interface GenerateSuggestionParams {
  messages: HookMessage[];
  userName: string;
  isRolePlay: boolean;
  era?: string;
  character?: string;
}

export async function generateMessageSuggestion({
  messages,
  userName,
  isRolePlay,
  era,
  character,
}: GenerateSuggestionParams): Promise<string> {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      console.warn('OpenAI client not initialized');
      return "";
    }

    // Convert HookMessage to the format needed for OpenAI
    const convertedMessages = messages.slice(-5).map(m => ({
      role: m.sender === 'ai' ? 'assistant' : 'user',
      content: m.content,
      name: m.sender
    }));

    const recentMessages = convertedMessages
      .map((m) => `${m.name || m.role}: ${m.content}`)
      .join("\n");

    let prompt = `Based on this recent conversation:\n${recentMessages}\n\nSuggest a response for ${userName}`;
    if (isRolePlay && era && character) {
      prompt += `, role-playing as ${character} in ${era}. Keep it historically accurate.`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: "You are a helpful assistant suggesting concise responses." }, { role: "user", content: prompt }],
      max_tokens: 100,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error generating message suggestion:", error);
    return "";
  }
}

interface TranslateMessageParams {
  message: string;
  targetLanguage: string;
}

export async function translateMessage({ message, targetLanguage }: TranslateMessageParams): Promise<string> {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      console.warn('OpenAI client not initialized');
      return message;
    }

    const prompt = `Translate the following message to ${targetLanguage}:\n\n"${message}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: "You are a professional translator." }, { role: "user", content: prompt }],
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || message;
  } catch (error) {
    console.error("Error translating message:", error);
    return message;
  }
}
