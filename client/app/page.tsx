// Triggering a new deployment with environment variables
// Add any additional comments or code changes here

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-800 to-blue-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 via-indigo-800/70 to-blue-900/70"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
          KLUMSI-LAND
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100">A private, invite-only chat experience</p>
        <p className="mb-12 text-lg text-blue-200 max-w-2xl mx-auto">
          Connect with KLUM in an exclusive one-on-one chat. Experience magical conversations and time-travel adventures together.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/enter-chat" passHref>
            <Button className="text-lg px-8 py-6 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 border-2 border-amber-300 shadow-lg">
              Enter KLUMSI-CHAT
            </Button>
          </Link>
          <Link href="/admin" passHref>
            <Button variant="outline" className="text-lg px-8 py-6 border-2 border-purple-400 text-purple-200 hover:bg-purple-900/30 shadow-lg">
              Admin Access
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative z-10 mt-16 text-center text-blue-200">
        <p>Only those with a secret code from KLUM may enter the magical realm.</p>
        <p className="mt-2 text-sm text-blue-300/70">Experience the "Slip into Secrets" time travel feature once inside!</p>
      </div>
    </div>
  )
}

