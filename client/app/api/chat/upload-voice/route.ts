import { NextResponse } from "next/server"
import { db, storage } from "@/lib/firebase/admin"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const sessionToken = formData.get("sessionToken") as string

    if (!audioFile || !sessionToken) {
      return NextResponse.json(
        { success: false, message: "Audio file and session token are required" },
        { status: 400 },
      )
    }

    // Validate session
    const sessionSnapshot = await db.collection("sessions").doc(sessionToken).get()
    if (!sessionSnapshot.exists || !sessionSnapshot.data()?.active) {
      return NextResponse.json({ success: false, message: "Invalid or inactive session" }, { status: 401 })
    }

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique filename
    const fileName = `voice-messages/${uuidv4()}.mp3`

    // Upload to Firebase Storage
    const file = storage.bucket().file(fileName)
    await file.save(buffer, {
      metadata: {
        contentType: "audio/mp3",
      },
    })

    // Make the file publicly accessible
    await file.makePublic()

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${storage.bucket().name}/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
    })
  } catch (error) {
    console.error("Error uploading voice message:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

