"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useChatStatus } from "@/lib/hooks/useChatStatus"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Default animation for floating elements that won't cause errors during static generation
const defaultAnimations = Array.from({ length: 15 }).map((_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  scale: Math.random() * 0.5 + 0.5,
  width: `${Math.random() * 100 + 50}px`,
  height: `${Math.random() * 100 + 50}px`,
}));

export default function EnterChat() {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const chatStatus = useChatStatus()

  // Mark component as mounted to avoid hydration issues with animations
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Skip session validation during static generation
    if (typeof window === 'undefined') {
      return;
    }

    // Check if user already has a valid session
    const sessionToken = localStorage.getItem("sessionToken")
    const userName = localStorage.getItem("userName")

    if (sessionToken && userName) {
      // Validate the session on the server
      fetch("/api/auth/validate-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            router.push("/chat")
          } else {
            // Clear invalid session
            localStorage.removeItem("sessionToken")
            localStorage.removeItem("userName")
            setIsCheckingStatus(false)
          }
        })
        .catch((err) => {
          console.error("Error validating session:", err)
          setIsCheckingStatus(false)
        })
    } else {
      setIsCheckingStatus(false)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (!name.trim()) {
        throw new Error("Please enter your name")
      }

      if (!code.trim()) {
        throw new Error("Please enter the secret code")
      }

      // Check if chat is available
      if (!chatStatus.chatAvailable && name.toUpperCase() !== "KLUM") {
        throw new Error(
          chatStatus.klumOnline
            ? "Another user is currently in the chat. Please try again later."
            : "KLUM is not online. Please try again later.",
        )
      }

      // Validate the code with the server
      const response = await fetch("/api/auth/validate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid secret code")
      }

      // Store user info and session token
      localStorage.setItem("userName", name)
      localStorage.setItem("sessionToken", data.sessionToken)

      // Redirect to chat
      router.push("/chat")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center text-white">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-4" />
          <p>Checking session status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 via-indigo-800/70 to-blue-900/70"></div>

        {/* Floating magical elements - only render on client */}
        {isMounted && (
          <AnimatePresence>
            {defaultAnimations.map((animation, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-20"
                initial={{
                  x: isMounted ? Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000) : animation.x,
                  y: isMounted ? Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600) : animation.y,
                  scale: animation.scale,
                }}
                animate={{
                  x: isMounted ? Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000) : animation.x,
                  y: isMounted ? Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600) : animation.y,
                  scale: animation.scale,
                }}
                transition={{
                  duration: Math.random() * 20 + 10,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
                style={{
                  width: animation.width,
                  height: animation.height,
                  filter: "blur(20px)",
                }}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border border-purple-500 shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              className="flex justify-center mb-4"
              animate={{
                rotateZ: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <Crown className="h-12 w-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
            </motion.div>
            <CardTitle className="text-2xl text-amber-300">Enter KLUMSI-CHAT</CardTitle>
            <CardDescription className="text-blue-200">
              Enter your name and the secret code provided by KLUM
            </CardDescription>
          </CardHeader>

          {isMounted && !chatStatus.chatAvailable && name.toUpperCase() !== "KLUM" && (
            <CardContent>
              <Alert className="bg-red-900/50 border-red-700 text-red-100">
                <AlertTitle>Chat Unavailable</AlertTitle>
                <AlertDescription>
                  {!chatStatus.klumOnline
                    ? "KLUM is currently offline. Please try again later."
                    : "Another user is currently in the chat. Please try again later."}
                </AlertDescription>
              </Alert>
            </CardContent>
          )}

          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-blue-100">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-blue-950/50 border-blue-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-medium text-blue-100">
                    Secret Code
                  </label>
                  <Input
                    id="code"
                    type="password"
                    placeholder="Enter the secret code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="bg-blue-950/50 border-blue-700 text-white"
                    required
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white relative overflow-hidden group"
                disabled={isLoading || (!chatStatus.chatAvailable && name.toUpperCase() !== "KLUM")}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Entering...
                  </>
                ) : (
                  <>
                    Enter the Realm
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-xs text-blue-300">
            Only those invited by KLUM may enter this magical space
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

