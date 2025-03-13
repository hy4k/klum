"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Lightbulb, Loader2 } from "lucide-react"
import { generateMessageSuggestion } from "@/lib/ai-service"
import type { Message } from "@/lib/hooks/useMessages"
import { motion, AnimatePresence } from "framer-motion"

interface MessageSuggestionsProps {
  messages: Message[]
  userName: string
  isRolePlay: boolean
  era?: string
  character?: string
  onSelectSuggestion: (suggestion: string) => void
}

export default function MessageSuggestions({
  messages,
  userName,
  isRolePlay,
  era,
  character,
  onSelectSuggestion,
}: MessageSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Generate suggestions when messages change significantly
  useEffect(() => {
    if (messages.length < 2) return

    // Only generate suggestions after every 3 messages
    if (messages.length % 3 !== 0) return

    generateSuggestions()
  }, [messages.length])

  const generateSuggestions = async () => {
    if (isLoading || messages.length < 2) return

    setIsLoading(true)
    setError("")

    try {
      const suggestion = await generateMessageSuggestion({
        messages,
        userName,
        isRolePlay,
        era,
        character,
      })

      if (suggestion) {
        setSuggestions([suggestion])
      }
    } catch (err) {
      console.error("Error generating suggestions:", err)
      setError("Failed to generate suggestions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    onSelectSuggestion(suggestion)
    setSuggestions([])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400 mr-2" />
        <span className="text-xs text-blue-300">Thinking of suggestions...</span>
      </div>
    )
  }

  if (error) {
    return null
  }

  return (
    <AnimatePresence>
      {suggestions.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2 py-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`text-xs ${
                isRolePlay
                  ? "bg-amber-950/30 border-amber-700/50 text-amber-200 hover:bg-amber-900/40"
                  : "bg-blue-950/30 border-blue-700/50 text-blue-200 hover:bg-blue-900/40"
              } flex items-center`}
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              {suggestion}
            </Button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

