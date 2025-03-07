"use client"

import { useEffect, useRef } from "react"
import { database } from "@/lib/firebase/client"
import { ref, onDisconnect, set, onValue, serverTimestamp } from "firebase/database"

interface PresenceOptions {
  userId: string
  role: "klum" | "user"
  displayName: string
}

export function usePresence({ userId, role, displayName }: PresenceOptions) {
  const presenceRef = useRef<any>(null)

  useEffect(() => {
    if (!userId) return

    // Create references
    const userStatusRef = ref(database, `status/${userId}`)
    const connectedRef = ref(database, ".info/connected")

    // Listen for connection state changes
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) {
        return
      }

      // When connected, update status and set up disconnect handler
      const statusOnDisconnect = onDisconnect(userStatusRef)

      statusOnDisconnect
        .set({
          online: false,
          lastSeen: serverTimestamp(),
          role,
        })
        .then(() => {
          // Update status to online
          set(userStatusRef, {
            online: true,
            displayName,
            role,
            lastActive: serverTimestamp(),
          })
        })
    })

    // Store refs for cleanup
    presenceRef.current = {
      userStatusRef,
      unsubscribe,
    }

    // Cleanup on unmount
    return () => {
      if (presenceRef.current) {
        presenceRef.current.unsubscribe()

        // Set status to offline when component unmounts
        set(userStatusRef, {
          online: false,
          lastSeen: serverTimestamp(),
          role,
        })
      }
    }
  }, [userId, role, displayName])

  return null
}

