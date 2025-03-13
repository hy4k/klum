"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Loader2 } from "lucide-react"
import { translateMessage } from "@/lib/ai-service"

interface TranslationDropdownProps {
  message: string
  onTranslate: (translatedText: string) => void
}

const languages = [
  { name: "Spanish", code: "Spanish" },
  { name: "French", code: "French" },
  { name: "German", code: "German" },
  { name: "Italian", code: "Italian" },
  { name: "Japanese", code: "Japanese" },
  { name: "Chinese", code: "Chinese" },
  { name: "Russian", code: "Russian" },
  { name: "Arabic", code: "Arabic" },
]

export default function TranslationDropdown({ message, onTranslate }: TranslationDropdownProps) {
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("")

  const handleTranslate = async (language: string) => {
    if (isTranslating) return

    setIsTranslating(true)
    setCurrentLanguage(language)

    try {
      const translatedText = await translateMessage({
        message,
        targetLanguage: language,
      })

      if (translatedText) {
        onTranslate(translatedText)
      }
    } catch (error) {
      console.error("Translation error:", error)
    } finally {
      setIsTranslating(false)
      setCurrentLanguage("")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-300 hover:bg-gray-800/30">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-gray-700 text-gray-200">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleTranslate(language.code)}
            disabled={isTranslating}
            className="focus:bg-gray-800 focus:text-white cursor-pointer"
          >
            {isTranslating && currentLanguage === language.code ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Translating...
              </>
            ) : (
              language.name
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

