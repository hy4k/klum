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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface RolePlaySettings {
  isActive: boolean
  era: string
  userCharacter: string
  klumCharacter: string
}

interface SecretsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (settings: RolePlaySettings) => void
  isAdmin: boolean
}

// Historical eras for selection
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
]

export default function SecretsModal({ isOpen, onClose, onConfirm, isAdmin }: SecretsModalProps) {
  const [era, setEra] = useState("")
  const [userCharacter, setUserCharacter] = useState("")
  const [klumCharacter, setKlumCharacter] = useState("")
  const [customEra, setCustomEra] = useState("")
  const [isCustomEra, setIsCustomEra] = useState(false)

  const handleConfirm = () => {
    const selectedEra = isCustomEra ? customEra : era

    if (!selectedEra || !userCharacter || !klumCharacter) {
      alert("Please fill in all fields to continue.")
      return
    }

    onConfirm({
      isActive: true,
      era: selectedEra,
      userCharacter,
      klumCharacter,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-b from-purple-950 to-indigo-950 border border-purple-500 text-white max-w-md">
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
            <Clock className="h-8 w-8 text-amber-400" />
          </motion.div>
          <DialogTitle className="text-center text-amber-300 text-xl">Slip into Secrets</DialogTitle>
          <DialogDescription className="text-center text-blue-200">
            Choose an era and characters for your time travel role-play
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="era" className="text-blue-100">
              Choose a Historical Era
            </Label>
            {isCustomEra ? (
              <div className="relative">
                <Input
                  id="customEra"
                  value={customEra}
                  onChange={(e) => setCustomEra(e.target.value)}
                  placeholder="Enter a custom era..."
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
            ) : (
              <Select onValueChange={setEra}>
                <SelectTrigger className="bg-blue-950/50 border-blue-700 text-white">
                  <SelectValue placeholder="Select an era" />
                </SelectTrigger>
                <SelectContent className="bg-blue-950 border-blue-700 text-white">
                  {historicalEras.map((era) => (
                    <SelectItem key={era} value={era} className="focus:bg-blue-800 focus:text-white">
                      {era}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center pt-1">
              <input
                type="checkbox"
                id="customEraToggle"
                checked={isCustomEra}
                onChange={() => setIsCustomEra(!isCustomEra)}
                className="mr-2"
              />
              <label htmlFor="customEraToggle" className="text-sm text-blue-200">
                Use a custom era
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userCharacter" className="text-blue-100">
                {isAdmin ? "Your Character (Male)" : "Your Character (Female)"}
              </Label>
              <Input
                id="userCharacter"
                value={userCharacter}
                onChange={(e) => setUserCharacter(e.target.value)}
                placeholder="e.g. King Arthur"
                className="bg-blue-950/50 border-blue-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="klumCharacter" className="text-blue-100">
                {isAdmin ? "Partner's Character (Female)" : "Partner's Character (Male)"}
              </Label>
              <Input
                id="klumCharacter"
                value={klumCharacter}
                onChange={(e) => setKlumCharacter(e.target.value)}
                placeholder="e.g. Queen Guinevere"
                className="bg-blue-950/50 border-blue-700 text-white"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-blue-600 text-blue-200 hover:bg-blue-900/50">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white relative overflow-hidden group"
          >
            Begin Time Travel
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

