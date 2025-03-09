'use client';

import { useState, useEffect } from 'react';
import { TimelineIndicator, TimeTravelTheme } from './ui/time-travel-theme';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useChat } from '@/hooks/use-chat';
import { useAI } from '@/hooks/use-ai';

interface Message {
  id: string;
  sender: string;
  content: string;
  character?: string;
  timestamp: number;
}

export function TimeTravelChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentEra, setCurrentEra] = useState({ era: 'Modern Day', year: 2025 });
  const [isKlumMode, setIsKlumMode] = useState(false);
  const [character, setCharacter] = useState('');
  const { sendMessage, isTyping } = useChat();
  const { generateStory, getHistoricalContext } = useAI();

  const historicalEras = [
    { era: 'Garden of Eden', year: -4000 },
    { era: 'Ancient Egypt', year: -3000 },
    { era: 'Roman Empire', year: 0 },
    { era: 'Medieval Times', year: 1000 },
    { era: 'Renaissance', year: 1500 },
    { era: 'Industrial Revolution', year: 1800 },
    { era: 'Modern Day', year: 2025 },
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content,
      character: isKlumMode ? character : undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);

    if (isKlumMode) {
      const historicalContext = await getHistoricalContext(currentEra.era, content);
      // AI response with historical context
      const aiResponse = await sendMessage(content, {
        era: currentEra.era,
        year: currentEra.year,
        context: historicalContext,
      });
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        content: aiResponse,
        character: 'KLUM',
        timestamp: Date.now(),
      }]);
    }
  };

  const handleWhatIf = async () => {
    const story = await generateStory(messages, currentEra);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'system',
      content: story,
      timestamp: Date.now(),
    }]);
  };

  return (
    <TimeTravelTheme className="p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-400">KLUMSI-CHAT</h1>
          <Button
            variant="outline"
            onClick={() => setIsKlumMode(!isKlumMode)}
            className="border-amber-400 text-amber-400 hover:bg-amber-400/10"
          >
            {isKlumMode ? 'Exit KLUM Mode' : 'Enter KLUM Mode'}
          </Button>
        </div>

        {isKlumMode && (
          <div className="flex gap-4 overflow-x-auto py-4">
            {historicalEras.map((era) => (
              <TimelineIndicator
                key={era.era}
                era={era.era}
                year={era.year}
                isActive={currentEra.era === era.era}
                onClick={() => setCurrentEra(era)}
                className="cursor-pointer"
              />
            ))}
          </div>
        )}

        <ScrollArea className="h-[600px] rounded-lg border border-amber-600/30 bg-black/40 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              {message.character && (
                <span className="text-sm text-amber-400">{message.character}:</span>
              )}
              <div
                className={`inline-block max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-amber-400/10 text-amber-100'
                    : 'bg-purple-400/10 text-purple-100'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder={isKlumMode ? `Speak as ${character || 'your character'}...` : 'Type a message...'}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e.currentTarget.value)}
            className="border-amber-600/30 bg-black/40 text-amber-100"
          />
          {isKlumMode && (
            <Button
              onClick={handleWhatIf}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              WHAT IF?
            </Button>
          )}
        </div>
      </div>
    </TimeTravelTheme>
  );
} 