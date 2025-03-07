"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Loader2, Copy, Check } from "lucide-react"

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerateCode = async () => {
    if (!adminKey) {
      setError("Admin key is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate code")
      }

      setGeneratedCode(data.code)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 via-indigo-800/70 to-blue-900/70"></div>
      </div>

      <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border border-purple-500 shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="h-12 w-12 text-amber-400" />
          </div>
          <CardTitle className="text-2xl text-amber-300">KLUMSI-LAND Admin</CardTitle>
          <CardDescription className="text-blue-200">Generate secret codes for users to enter the chat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="adminKey" className="text-sm font-medium text-blue-100">
                Admin Key
              </label>
              <Input
                id="adminKey"
                type="password"
                placeholder="Enter admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="bg-blue-950/50 border-blue-700 text-white"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">{error}</div>
            )}

            {generatedCode && (
              <div className="p-4 bg-green-900/30 border border-green-700 rounded-md">
                <div className="text-sm text-green-200 mb-2">Generated Code:</div>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-mono text-green-100 tracking-wider">{generatedCode}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyCode}
                    className="text-green-200 hover:text-green-100 hover:bg-green-800/30"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenerateCode}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Secret Code"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

