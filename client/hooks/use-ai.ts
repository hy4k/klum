import { useState } from 'react';

interface HistoricalEra {
  era: string;
  year: number;
}

interface Message {
  sender: string;
  content: string;
  character?: string;
  timestamp: number;
}

export function useAI() {
  const [isProcessing, setIsProcessing] = useState(false);

  const getHistoricalContext = async (era: string, message: string) => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/historical-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ era, message }),
      });

      if (!response.ok) throw new Error('Failed to get historical context');
      
      const data = await response.json();
      return data.context;
    } catch (error) {
      console.error('Error getting historical context:', error);
      return '';
    } finally {
      setIsProcessing(false);
    }
  };

  const generateStory = async (messages: Message[], currentEra: HistoricalEra) => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          era: currentEra.era,
          year: currentEra.year,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate story');
      
      const data = await response.json();
      return data.story;
    } catch (error) {
      console.error('Error generating story:', error);
      return 'Failed to generate the story. Please try again.';
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    getHistoricalContext,
    generateStory,
  };
} 