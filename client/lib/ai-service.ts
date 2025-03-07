import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_AI_API_KEY,
});

interface Message {
  role: string;
  content: string;
  name?: string;
}

interface GenerateStoryParams {
  era: string;
  characters: string[];
  messages: Message[];
}

export async function generateAIStory({ era, characters, messages }: GenerateStoryParams): Promise<string> {
  try {
    const prompt = `
      Create a historical fiction story based on the following:
      Era: ${era}
      Characters: ${characters.join(", ")}
      Recent conversation:
      ${messages.map((m) => `${m.name || m.role}: ${m.content}`).join("\n")}
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
  messages: Message[];
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
    const recentMessages = messages
      .slice(-5)
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
