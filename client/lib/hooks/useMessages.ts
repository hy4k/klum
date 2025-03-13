"use client"

import { useState, useEffect } from "react"
import { firestore } from "@/lib/firebase/client"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from "firebase/firestore"
import { storage } from "@/lib/firebase/client"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"

export interface Message {
  id: string
  sender: string
  content: string
  timestamp: any
  isVoice: boolean
  isImage?: boolean
  isRolePlay?: boolean
  character?: string
  aiGenerated?: boolean
}

interface UseMessagesOptions {
  sessionToken: string
}

export function useMessages({ sessionToken }: UseMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load and listen to messages
  useEffect(() => {
    if (!sessionToken) return

    setLoading(true)

    const messagesQuery = query(
      collection(firestore, "messages"),
      where("sessionToken", "==", sessionToken),
      orderBy("timestamp", "asc"),
    )

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[]

        setMessages(newMessages)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching messages:", err)
        setError("Failed to load messages")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [sessionToken])

  // Function to send a text message
  const sendTextMessage = async (
    content: string,
    sender: string,
    isRolePlay = false,
    character?: string,
    aiGenerated = false,
  ) => {
    if (!sessionToken || !content.trim()) return null

    try {
      const messageData = {
        content,
        sender,
        sessionToken,
        timestamp: serverTimestamp(),
        isVoice: false,
        isImage: false,
        isRolePlay,
        character: isRolePlay ? character : undefined,
        aiGenerated,
        createdAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(firestore, "messages"), messageData)
      return docRef.id
    } catch (err) {
      console.error("Error sending message:", err)
      setError("Failed to send message")
      return null
    }
  }

  // Function to upload and send a voice message
  const sendVoiceMessage = async (audioBlob: Blob, sender: string) => {
    if (!sessionToken) return null

    try {
      // Create a reference to upload the file
      const fileName = `voice-messages/${sessionToken}/${uuidv4()}.mp3`
      const storageRef = ref(storage, fileName)

      // Upload the blob
      await uploadBytes(storageRef, audioBlob, {
        contentType: "audio/mp3",
      })

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef)

      // Save the message with the audio URL
      const messageData = {
        content: downloadURL,
        sender,
        sessionToken,
        timestamp: serverTimestamp(),
        isVoice: true,
        isImage: false,
        createdAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(firestore, "messages"), messageData)
      return docRef.id
    } catch (err) {
      console.error("Error sending voice message:", err)
      setError("Failed to send voice message")
      return null
    }
  }

  // Function to send an image message
  const sendImageMessage = async (imageUrl: string, sender: string, isRolePlay = false, character?: string) => {
    if (!sessionToken || !imageUrl) return null

    try {
      const messageData = {
        content: imageUrl,
        sender,
        sessionToken,
        timestamp: serverTimestamp(),
        isVoice: false,
        isImage: true,
        isRolePlay,
        character: isRolePlay ? character : undefined,
        createdAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(firestore, "messages"), messageData)
      return docRef.id
    } catch (err) {
      console.error("Error sending image message:", err)
      setError("Failed to send image message")
      return null
    }
  }

  return {
    messages,
    loading,
    error,
    sendTextMessage,
    sendVoiceMessage,
    sendImageMessage,
  }
}

