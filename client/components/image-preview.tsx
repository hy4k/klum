"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X, Download, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ImagePreviewProps {
  src: string
  isOpen: boolean
  onClose: () => void
}

export default function ImagePreview({ src, isOpen, onClose }: ImagePreviewProps) {
  const [scale, setScale] = useState(1)

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = src
    link.download = `klumsi-land-image-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/90 border-gray-800">
        <div className="relative w-full h-full flex flex-col">
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="bg-black/50 text-white hover:bg-black/70">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <motion.img
              src={src}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              style={{ scale }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

