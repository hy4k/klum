"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase/client"
import { ref, onValue } from "firebase/database"

interface ChatStatus {
  klumOnline: boolean
  hasActiveUser: boolean
  chatAvailable: boolean
  loading: boolean
  error: string | null
}

export function useChatStatus() {
  const [status, setStatus] = useState<ChatStatus>({
    klumOnline: false,
    hasActiveUser: false,
    chatAvailable: false,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Skip Firebase operations if database is not initialized
    if (!database) {
      setStatus({
        klumOnline: false,
        hasActiveUser: false,
        chatAvailable: false,
        loading: false,
        error: "Firebase not initialized",
      });
      return () => {}; // Return empty cleanup function
    }

    // Reference to KLUM's status
    const klumStatusRef = ref(database, "status/klum")

    // Listen for KLUM's status changes
    const klumStatusUnsubscribe = onValue(
      klumStatusRef,
      (snapshot) => {
        const klumData = snapshot.val()
        const klumOnline = klumData?.online || false

        setStatus((prev) => ({
          ...prev,
          klumOnline,
          chatAvailable: klumOnline && !prev.hasActiveUser,
          loading: false,
        }))
      },
      (error) => {
        console.error("Error getting KLUM status:", error)
        setStatus((prev) => ({
          ...prev,
          error: "Failed to get chat status",
          loading: false,
        }))
      },
    )

    // Query for active users
    const activeUsersRef = ref(database, "status")

    // Listen for active users changes
    const activeUsersUnsubscribe = onValue(
      activeUsersRef,
      (snapshot) => {
        let hasActiveUser = false

        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val()
          if (childSnapshot.key !== "klum" && userData?.online && userData?.role === "user") {
            hasActiveUser = true
          }
        })

        setStatus((prev) => ({
          ...prev,
          hasActiveUser,
          chatAvailable: prev.klumOnline && !hasActiveUser,
          loading: false,
        }))
      },
      (error) => {
        console.error("Error getting active users:", error)
        setStatus((prev) => ({
          ...prev,
          error: "Failed to get active users",
          loading: false,
        }))
      },
    )

    // Cleanup
    return () => {
      klumStatusUnsubscribe()
      activeUsersUnsubscribe()
    }
  }, [])

  return status
}

