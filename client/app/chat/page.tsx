"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Crown, Mic, Send, StopCircle, Volume2, X, Clock, Wand2, Loader2, Sparkles, ImageIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import SecretsModal from "@/components/secrets-modal"
import StoryDisplay from "@/components/story-display"
import ImagePreview from "@/components/image-preview"
import AIImageModal from "@/components/ai-image-modal"
import MessageSuggestions from "@/components/message-suggestions"
import TranslationDropdown from "@/components/translation-dropdown"
import { useMessages, type Message } from "@/lib/hooks/useMessages"
import { usePresence } from "@/lib/hooks/usePresence"
import { generateAIStory } from "@/lib/ai-service"

interface RolePlaySettings {
  isActive: boolean
  era: string
  userCharacter: string
  klumCharacter: string
}

export default function Chat() {
  const [userName, setUserName] = useState("")
  const [sessionToken, setSessionToken] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [showSecretsModal, setShowSecretsModal] = useState(false)
  const [rolePlaySettings, setRolePlaySettings] = useState<RolePlaySettings>({
    isActive: false,
    era: "",
    userCharacter: "",
    klumCharacter: "",
  })
  const [generatedStory, setGeneratedStory] = useState<string | null>(null)
  const [showStoryDisplay, setShowStoryDisplay] = useState(false)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [showAIImageModal, setShowAIImageModal] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Use our custom hooks for messages and presence
  const { messages, loading, error, sendTextMessage, sendVoiceMessage, sendImageMessage } = useMessages({
    sessionToken,
  })

  useEffect(() => {
    // Check if user has a valid session
    const storedSessionToken = localStorage.getItem("sessionToken")
    const storedUserName = localStorage.getItem("userName")

    if (!storedSessionToken || !storedUserName) {
      router.push("/enter-chat")
      return
    }

    setSessionToken(storedSessionToken)
    setUserName(storedUserName)

    // For demo purposes, if the name is "KLUM", set as admin
    if (storedUserName.toUpperCase() === "KLUM") {
      setIsAdmin(true)
    }
  }, [router])

  // Set up presence tracking
  usePresence({
    userId: sessionToken || "anonymous",
    role: isAdmin ? "klum" : "user",
    displayName: userName,
  })

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "" && !audioBlob) return

    const sender = isAdmin ? "KLUM" : userName

    if (audioBlob) {
      // Send voice message
      await sendVoiceMessage(audioBlob, sender)
      setAudioURL(null)
      setAudioBlob(null)
    } else {
      // Send text message
      await sendTextMessage(
        newMessage,
        sender,
        rolePlaySettings.isActive,
        rolePlaySettings.isActive
          ? isAdmin
            ? rolePlaySettings.klumCharacter
            : rolePlaySettings.userCharacter
          : undefined,
      )
      setNewMessage("")
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioURL(audioUrl)
        setAudioBlob(audioBlob)

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      alert("Could not access your microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setAudioURL(null)
      setAudioBlob(null)
    } else if (audioURL) {
      setAudioURL(null)
      setAudioBlob(null)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    setIsUploadingImage(true)

    try {
      // Create form data for upload
      const formData = new FormData()
      formData.append("image", file)
      formData.append("sessionToken", sessionToken)

      // Upload image to server
      const response = await fetch("/api/chat/upload-image", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload image")
      }

      // Send image message
      const sender = isAdmin ? "KLUM" : userName
      await sendImageMessage(
        data.url,
        sender,
        rolePlaySettings.isActive,
        rolePlaySettings.isActive
          ? isAdmin
            ? rolePlaySettings.klumCharacter
            : rolePlaySettings.userCharacter
          : undefined,
      )

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleAIImageGenerate = () => {
    if (!rolePlaySettings.isActive) {
      alert("AI image generation is only available in role-play mode")
      return
    }

    setShowAIImageModal(true)
  }

  const handleAIImageCreated = async (imageUrl: string) => {
    if (!imageUrl) return

    try {
      // Send AI-generated image as a message
      const sender = isAdmin ? "KLUM" : userName
      await sendImageMessage(
        imageUrl,
        sender,
        true,
        isAdmin ? rolePlaySettings.klumCharacter : rolePlaySettings.userCharacter,
      )

      // Add a system message about the AI-generated image
      await sendTextMessage(
        `🎨 ${sender} created an AI-generated image depicting a scene from ${rolePlaySettings.era}.`,
        "System",
        false,
      )
    } catch (error) {
      console.error("Error sending AI image:", error)
    }
  }

  const endChat = async () => {
    try {
      // Call the API to end the session
      await fetch("/api/auth/end-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionToken }),
      })
    } catch (error) {
      console.error("Error ending session:", error)
    } finally {
      // Clear local storage and redirect to home
      localStorage.removeItem("sessionToken")
      localStorage.removeItem("userName")
      router.push("/")
    }
  }

  const handleSecretsToggle = () => {
    setShowSecretsModal(true)
  }

  const handleSecretsConfirm = async (settings: RolePlaySettings) => {
    setRolePlaySettings(settings)
    setShowSecretsModal(false)

    // Add a system message about entering role-play mode
    await sendTextMessage(
      `🕰️ Time travel activated! You are now in ${settings.era}. ${isAdmin ? userName : "KLUM"} is ${settings.userCharacter} and ${isAdmin ? "KLUM" : userName} is ${settings.klumCharacter}.`,
      "System",
      false,
    )
  }

  const handleMakeItHappen = async () => {
    if (!rolePlaySettings.isActive) return

    setIsGeneratingStory(true)

    try {
      // Get the last 10 messages for context
      const recentMessages = messages.slice(-10).map((msg) => ({
        role: msg.sender === "System" ? "system" : "user",
        content: msg.content,
        name: msg.sender,
      }))

      // Generate a story using AI
      const story = await generateAIStory({
        era: rolePlaySettings.era,
        characters: [rolePlaySettings.userCharacter, rolePlaySettings.klumCharacter],
        messages: recentMessages,
      })

      setGeneratedStory(story)
      setShowStoryDisplay(true)
    } catch (error) {
      console.error("Error generating story:", error)
      alert("Failed to generate story. Please try again.")
    } finally {
      setIsGeneratingStory(false)
    }
  }

  const handleCloseStory = () => {
    setShowStoryDisplay(false)
    setGeneratedStory(null)
  }

  const exitRolePlay = async () => {
    setRolePlaySettings({
      isActive: false,
      era: "",
      userCharacter: "",
      klumCharacter: "",
    })

    // Add a system message about exiting role-play mode
    await sendTextMessage("🕰️ Time travel deactivated. You have returned to the present.", "System", false)
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setShowImagePreview(true)
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setNewMessage(suggestion)
  }

  const handleTranslate = (message: Message, translatedText: string) => {
    // Add a translated message as a system message
    sendTextMessage(`Translation: ${translatedText}`, "System", false)
  }

  if (!userName || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-4" />
          <p>{loading ? "Loading messages..." : "Connecting..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-800 to-blue-900 flex flex-col">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 via-indigo-800/70 to-blue-900/70"></div>

        {/* Magical particles */}
        <AnimatePresence>
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5,
                opacity: Math.random() * 0.7,
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                width: "4px",
                height: "4px",
                boxShadow: "0 0 10px 2px rgba(255, 255, 255, 0.8)",
              }}
            />
          ))}
        </AnimatePresence>

        {rolePlaySettings.isActive && (
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10 sepia"></div>
        )}
      </div>

      {/* Header */}
      <motion.header
        className={`relative z-10 flex items-center justify-between p-4 border-b ${rolePlaySettings.isActive ? "border-amber-600 bg-amber-950/30" : "border-purple-600 bg-black/30"} backdrop-blur-sm`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          {isAdmin && (
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <Crown className="h-6 w-6 text-amber-400 mr-2 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            </motion.div>
          )}
          <h1 className={`text-xl font-bold ${isAdmin ? "text-amber-300" : "text-blue-300"}`}>
            {rolePlaySettings.isActive
              ? isAdmin
                ? rolePlaySettings.klumCharacter
                : rolePlaySettings.userCharacter
              : isAdmin
                ? "KLUM"
                : userName}
          </h1>
          {rolePlaySettings.isActive && (
            <span className="ml-2 text-sm text-amber-200/70">({rolePlaySettings.era})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rolePlaySettings.isActive ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMakeItHappen}
                disabled={isGeneratingStory}
                className="bg-amber-800/50 hover:bg-amber-700/50 border-amber-500 text-amber-200 relative overflow-hidden group"
              >
                {isGeneratingStory ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-1" />
                    Make It Happen
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIImageGenerate}
                className="bg-indigo-800/50 hover:bg-indigo-700/50 border-indigo-500 text-indigo-200"
              >
                <ImageIcon className="h-4 w-4 mr-1" /> Create Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exitRolePlay}
                className="bg-red-800/50 hover:bg-red-700/50 border-red-500 text-red-200"
              >
                <Clock className="h-4 w-4 mr-1" /> Exit Time Travel
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSecretsToggle}
              className="bg-purple-800/50 hover:bg-purple-700/50 border-purple-500 text-purple-200 relative overflow-hidden group"
            >
              <Clock className="h-4 w-4 mr-1" />
              Slip into Secrets
              <motion.div
                className="absolute right-2 top-1"
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
                <Sparkles className="h-3 w-3 text-purple-300" />
              </motion.div>
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={endChat} className="bg-red-800 hover:bg-red-700">
            <X className="h-4 w-4 mr-1" /> End Chat
          </Button>
        </div>
      </motion.header>

      {/* Chat Messages */}
      <div
        className={`relative z-10 flex-1 overflow-y-auto p-4 space-y-4 ${rolePlaySettings.isActive ? "bg-amber-950/10" : ""}`}
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.sender === "System" ? "justify-center" : message.sender === "KLUM" ? "justify-start" : "justify-end"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message.sender === "System" ? (
                <div className="bg-purple-900/70 border border-purple-500/50 text-purple-200 px-4 py-2 rounded-lg text-sm max-w-[80%]">
                  {message.content}
                </div>
              ) : (
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "KLUM"
                      ? message.isRolePlay
                        ? "bg-gradient-to-r from-amber-800/80 to-amber-950/80 border border-amber-600/50 text-amber-100"
                        : "bg-gradient-to-r from-amber-700/80 to-amber-900/80 border border-amber-500/50 text-amber-100"
                      : message.isRolePlay
                        ? "bg-gradient-to-r from-blue-800/80 to-blue-950/80 border border-blue-600/50 text-blue-100"
                        : "bg-gradient-to-r from-blue-700/80 to-blue-900/80 border border-blue-500/50 text-blue-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      {message.sender === "KLUM" && <Crown className="h-4 w-4 text-amber-400 mr-1" />}
                      <span
                        className={`text-xs font-bold ${message.sender === "KLUM" ? "text-amber-300" : "text-blue-300"}`}
                      >
                        {message.isRolePlay ? message.character : message.sender}
                      </span>
                    </div>
                    {!message.isVoice && !message.isImage && (
                      <TranslationDropdown
                        message={message.content}
                        onTranslate={(translatedText) => handleTranslate(message, translatedText)}
                      />
                    )}
                  </div>

                  {message.isVoice ? (
                    <div className="flex items-center">
                      <audio src={message.content} controls className="max-w-full" />
                    </div>
                  ) : message.isImage ? (
                    <div className="cursor-pointer" onClick={() => handleImageClick(message.content)}>
                      <img
                        src={message.content || "/placeholder.svg"}
                        alt="Shared image"
                        className="max-w-full rounded-md border border-gray-700/50 hover:opacity-90 transition-opacity"
                      />
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}

                  <div className="text-right mt-1">
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Suggestions */}
      {messages.length > 0 && (
        <div className={`relative z-10 px-4 ${rolePlaySettings.isActive ? "bg-amber-950/20" : "bg-blue-950/20"}`}>
          <MessageSuggestions
            messages={messages}
            userName={userName}
            isRolePlay={rolePlaySettings.isActive}
            era={rolePlaySettings.era}
            character={
              rolePlaySettings.isActive
                ? isAdmin
                  ? rolePlaySettings.klumCharacter
                  : rolePlaySettings.userCharacter
                : undefined
            }
            onSelectSuggestion={handleSuggestionSelect}
          />
        </div>
      )}

      {/* Message Input */}
      <motion.div
        className={`relative z-10 p-4 ${rolePlaySettings.isActive ? "bg-amber-950/30 border-t border-amber-800/50" : "bg-black/30 backdrop-blur-sm border-t border-purple-600"}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {audioURL ? (
            <div className="flex-1 bg-blue-950/50 rounded-md p-2 flex items-center">
              <Volume2 className="h-5 w-5 text-blue-400 mr-2" />
              <audio src={audioURL} controls className="flex-1 h-8" />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={cancelRecording}
                className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                rolePlaySettings.isActive
                  ? `Type as ${isAdmin ? rolePlaySettings.klumCharacter : rolePlaySettings.userCharacter}...`
                  : "Type your message..."
              }
              className={`flex-1 ${
                rolePlaySettings.isActive
                  ? "bg-amber-950/50 border-amber-700 text-amber-100"
                  : "bg-blue-950/50 border-blue-700 text-white"
              }`}
              disabled={isRecording}
            />
          )}

          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />

          <TooltipProvider>
            {isRecording ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    onClick={stopRecording}
                    className="bg-red-700 hover:bg-red-600 text-white animate-pulse"
                  >
                    <StopCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Stop Recording</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    onClick={startRecording}
                    className="bg-blue-700 hover:bg-blue-600 text-white"
                    disabled={!!audioURL || isUploadingImage}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Record Voice Message</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-700 hover:bg-indigo-600 text-white"
                  disabled={isRecording || !!audioURL || isUploadingImage}
                >
                  {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share Image</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            type="submit"
            size="icon"
            className={`${
              rolePlaySettings.isActive
                ? "bg-amber-800 hover:bg-amber-700"
                : isAdmin
                  ? "bg-amber-700 hover:bg-amber-600"
                  : "bg-blue-700 hover:bg-blue-600"
            } text-white relative overflow-hidden`}
            disabled={isRecording || (newMessage.trim() === "" && !audioURL) || isUploadingImage}
          >
            <Send className="h-5 w-5" />
            <motion.div
              className="absolute inset-0 bg-white opacity-0"
              whileHover={{ opacity: 0.2 }}
              transition={{ duration: 0.2 }}
            />
          </Button>
        </form>
      </motion.div>

      {/* Modals */}
      <SecretsModal
        isOpen={showSecretsModal}
        onClose={() => setShowSecretsModal(false)}
        onConfirm={handleSecretsConfirm}
        isAdmin={isAdmin}
      />

      <StoryDisplay
        isOpen={showStoryDisplay}
        onClose={handleCloseStory}
        story={generatedStory || ""}
        era={rolePlaySettings.era}
        characters={[rolePlaySettings.userCharacter, rolePlaySettings.klumCharacter]}
      />

      <ImagePreview isOpen={showImagePreview} onClose={() => setShowImagePreview(false)} src={selectedImage || ""} />

      <AIImageModal
        isOpen={showAIImageModal}
        onClose={() => setShowAIImageModal(false)}
        onImageGenerated={handleAIImageCreated}
        era={rolePlaySettings.era}
        characters={[rolePlaySettings.userCharacter, rolePlaySettings.klumCharacter]}
      />
    </div>
  )
}

