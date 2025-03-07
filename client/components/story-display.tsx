"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Download, Share2 } from "lucide-react"
import { motion } from "framer-motion"

interface StoryDisplayProps {
  isOpen: boolean
  onClose: () => void
  story: string
  era: string
  characters: string[]
}

export default function StoryDisplay({ isOpen, onClose, story, era, characters }: StoryDisplayProps) {
  const handleDownload = () => {
    // Create a blob with the story text
    const blob = new Blob([`${era} - A Tale of ${characters.join(" and ")}\n\n${story}`], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    // Create a temporary link and trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = `klumsi-land-story-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog or copy to clipboard
    if (navigator.share) {
      navigator
        .share({
          title: `${era} - A Tale of ${characters.join(" and ")}`,
          text: story,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
          // Fallback to clipboard
          navigator.clipboard.writeText(story)
          alert("Story copied to clipboard!")
        })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(story)
      alert("Story copied to clipboard!")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-b from-amber-950 to-brown-950 border border-amber-700 text-amber-100 max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="text-center border-b border-amber-800/50 pb-4">
          <motion.div
            className="flex items-center justify-center mb-2"
            animate={{
              rotate: [0, 3, -3, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <BookOpen className="h-8 w-8 text-amber-400" />
          </motion.div>
          <DialogTitle className="text-amber-300 text-xl">
            {era} - A Tale of {characters.join(" and ")}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 my-4 pr-4">
          <div className="space-y-4 text-amber-100 leading-relaxed">
            <p className="text-lg italic text-amber-200/80 text-center">
              "History is not what happened, but what has been recorded..."
            </p>

            <motion.div
              className="bg-amber-950/30 p-6 rounded-lg border border-amber-800/30 font-serif"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {story.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </motion.div>

            <p className="text-sm text-amber-300/70 text-right italic">- As reimagined by KLUMSI-LAND</p>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-amber-800/50 pt-4 flex flex-col sm:flex-row gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-amber-700 text-amber-200 hover:bg-amber-900/50"
            >
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-amber-700 text-amber-200 hover:bg-amber-900/50"
            >
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
          </div>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white relative overflow-hidden group"
          >
            Continue Role-Play
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

