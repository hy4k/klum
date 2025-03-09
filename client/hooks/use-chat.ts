import { useState } from 'react';
import { auth } from '@/lib/firebase';

interface ChatOptions {
  era?: string;
  year?: number;
  context?: string;
}

export function useChat() {
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (content: string, options?: ChatOptions) => {
    try {
      setIsTyping(true);
      const user = auth.currentUser;
      
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          content,
          ...options,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      return 'Failed to send message. Please try again.';
    } finally {
      setIsTyping(false);
    }
  };

  return {
    sendMessage,
    isTyping,
  };
} 