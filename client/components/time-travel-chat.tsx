'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Wand2, Send, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface Message {
  id: string;
  sender: string;
  content: string;
  character?: string;
  timestamp: any;
  sessionToken: string;
}

interface TimeTravelChatProps {
  userName: string;
  sessionToken: string;
  isAdmin: boolean;
}

interface Character {
  name: string;
  gender: 'male' | 'female';
}

export default function TimeTravelChat({ userName, sessionToken, isAdmin }: TimeTravelChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentEra, setCurrentEra] = useState('Modern Day');
  const [userCharacter, setUserCharacter] = useState<Character>({ name: '', gender: 'male' });
  const [klumCharacter, setKlumCharacter] = useState<Character>({ name: '', gender: 'female' });
  const [isTimeTravelMode, setIsTimeTravelMode] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const historicalEras = [
    "Biblical Times (Adam & Eve)",
    "Ancient Egypt (3000-30 BCE)",
    "Ancient Greece (800-31 BCE)",
    "Roman Empire (27 BCE-476 CE)",
    "Medieval Europe (476-1453)",
    "Renaissance (14th-17th century)",
    "Age of Enlightenment (17th-18th century)",
    "Victorian Era (1837-1901)",
    "Roaring Twenties (1920s)",
    "World War II (1939-1945)",
    "Cold War Era (1947-1991)",
    "Information Age (1990s-present)",
  ];

  useEffect(() => {
    if (!sessionToken) return;

    // Listen for messages
    const messagesQuery = query(
      collection(db, "messages"),
      where("sessionToken", "==", sessionToken),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [sessionToken]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        sender: userName,
        sessionToken,
        timestamp: serverTimestamp(),
        isTimeTravelMode,
        character: isTimeTravelMode ? (userName === 'KLUM' ? klumCharacter.name : userCharacter.name) : undefined,
        era: isTimeTravelMode ? currentEra : undefined,
      };

      await addDoc(collection(db, "messages"), messageData);
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const generateStory = async () => {
    if (messages.length < 4) {
      alert("Please have a longer conversation before generating a story");
      return;
    }

    setIsGeneratingStory(true);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.filter(m => m.isTimeTravelMode),
          era: currentEra,
          userCharacter: userCharacter.name,
          klumCharacter: klumCharacter.name,
          sessionToken,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedStory(data.story);
        
        // Save the story to Firestore
        await addDoc(collection(db, "timeTravel"), {
          story: data.story,
          era: currentEra,
          userCharacter: userCharacter.name,
          klumCharacter: klumCharacter.name,
          timestamp: serverTimestamp(),
          sessionToken,
        });
      }
    } catch (error) {
      console.error("Error generating story:", error);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const startTimeTravelMode = () => {
    if (!userCharacter.name || !klumCharacter.name) {
      alert("Please select characters for both users");
      return;
    }
    setIsTimeTravelMode(true);
  };

  const exitTimeTravelMode = () => {
    setIsTimeTravelMode(false);
    setGeneratedStory(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!isTimeTravelMode ? (
        <Card className="bg-gradient-to-b from-purple-950 to-indigo-950 border border-purple-500 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-amber-300 flex items-center justify-center gap-2">
              <Clock className="h-5 w-5" />
              Slip into Secrets - Time Travel Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">Choose a Historical Era</label>
              <Select value={currentEra} onValueChange={setCurrentEra}>
                <SelectTrigger className="bg-blue-950/50 border-blue-700 text-white">
                  <SelectValue placeholder="Select an era" />
                </SelectTrigger>
                <SelectContent className="bg-blue-950 border-blue-700">
                  {historicalEras.map((era) => (
                    <SelectItem key={era} value={era} className="text-blue-100">
                      {era}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">Your Character</label>
                <Input
                  placeholder="Enter your character name"
                  value={userCharacter.name}
                  onChange={(e) => setUserCharacter({ ...userCharacter, name: e.target.value })}
                  className="bg-blue-950/50 border-blue-700 text-white"
                />
                <Select 
                  value={userCharacter.gender} 
                  onValueChange={(value: 'male' | 'female') => setUserCharacter({ ...userCharacter, gender: value })}
                >
                  <SelectTrigger className="bg-blue-950/50 border-blue-700 text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-950 border-blue-700">
                    <SelectItem value="male" className="text-blue-100">Male</SelectItem>
                    <SelectItem value="female" className="text-blue-100">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">KLUM's Character</label>
                <Input
                  placeholder="Enter KLUM's character name"
                  value={klumCharacter.name}
                  onChange={(e) => setKlumCharacter({ ...klumCharacter, name: e.target.value })}
                  className="bg-blue-950/50 border-blue-700 text-white"
                />
                <Select 
                  value={klumCharacter.gender} 
                  onValueChange={(value: 'male' | 'female') => setKlumCharacter({ ...klumCharacter, gender: value })}
                >
                  <SelectTrigger className="bg-blue-950/50 border-blue-700 text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-950 border-blue-700">
                    <SelectItem value="male" className="text-blue-100">Male</SelectItem>
                    <SelectItem value="female" className="text-blue-100">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={startTimeTravelMode} 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white"
              disabled={!userCharacter.name || !klumCharacter.name}
            >
              <Clock className="mr-2 h-4 w-4" />
              Begin Time Travel Adventure
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-900 to-indigo-900 p-3 rounded-lg border border-purple-500">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <span className="text-amber-300 font-medium">{currentEra}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={generateStory} 
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isGeneratingStory || messages.filter(m => m.isTimeTravelMode).length < 4}
              >
                {isGeneratingStory ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Make It Happen
                  </>
                )}
              </Button>
              <Button 
                onClick={exitTimeTravelMode} 
                variant="outline" 
                className="border-purple-500 text-purple-200 hover:bg-purple-800/30"
              >
                Exit Time Travel
              </Button>
            </div>
          </div>

          {generatedStory && (
            <Card className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-500/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <h3 className="text-amber-300 font-medium">Your Historical Tale</h3>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-amber-100/90 italic">{generatedStory}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <ScrollArea className="h-[400px] rounded-md border border-purple-700 bg-black/30 p-4">
            <div className="space-y-4">
              {messages.filter(m => m.isTimeTravelMode).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'KLUM' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'KLUM'
                        ? 'bg-indigo-900/70 text-indigo-100'
                        : 'bg-purple-900/70 text-purple-100'
                    }`}
                  >
                    <div className="font-medium text-amber-300 mb-1">
                      {message.character || message.sender}
                    </div>
                    <div>{message.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Type as ${userName === 'KLUM' ? klumCharacter.name : userCharacter.name}...`}
              className="bg-blue-950/50 border-blue-700 text-white"
            />
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
} 
