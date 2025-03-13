"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ImageIcon, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { generateAIImage } from "@/lib/ai-service"

interface AIImageModalProps {
  isOpen: boolean
  onClose: () => void
  onImageGenerated: (imageUrl: string) => void
  era: string
  characters: string[]
}

export default function AIImageModal({ isOpen, onClose, onImageGenerated, era, characters }: AIImageModalProps) {
  const [scene, setScene] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!scene.trim()) {
      setError("Please describe the scene you want to generate")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const imageUrl = await generateAIImage({
        era,
        characters,
        scene,
      })

      if (!imageUrl) {
        throw new Error("Failed to generate image")
      }

      onImageGenerated(imageUrl)
      onClose()
    } catch (err) {
      console.error("Error generating image:", err)
      setError("Failed to generate image. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-b from-indigo-950 to-purple-950 border border-indigo-500 text-white max-w-md">
        <DialogHeader>
          <motion.div
            className="flex items-center justify-center mb-2"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <ImageIcon className="h-8 w-8 text-indigo-400" />
          </motion.div>
          <DialogTitle className="text-center text-indigo-300 text-xl">Generate Historical Image</DialogTitle>
          <DialogDescription className="text-center text-blue-200">
            Create an AI-generated image of {characters.join(" and ")} in {era}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="scene" className="text-blue-100">
              Describe the scene
            </Label>
            <div className="relative">
              <Input
                id="scene"
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                placeholder="e.g. standing on a balcony overlooking the city at sunset"
                className="bg-blue-950/50 border-blue-700 text-white pr-8"
              />
              <motion.div
                className="absolute right-2 top-2"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                <Sparkles className="h-4 w-4 text-blue-300" />
              </motion.div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-blue-600 text-blue-200 hover:bg-blue-900/50">
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !scene.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white relative overflow-hidden group"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Image
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400/0 via-indigo-400/30 to-indigo-400/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

