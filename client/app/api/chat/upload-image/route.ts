import { NextResponse } from "next/server"
import { db, storage } from "@/lib/firebase/admin"
import { v4 as uuidv4 } from "uuid"
import sharp from "sharp"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File
    const sessionToken = formData.get("sessionToken") as string

    if (!imageFile || !sessionToken) {
      return NextResponse.json(
        { success: false, message: "Image file and session token are required" },
        { status: 400 },
      )
    }

    // Validate session
    const sessionSnapshot = await db.collection("sessions").doc(sessionToken).get()
    if (!sessionSnapshot.exists || !sessionSnapshot.data()?.active) {
      return NextResponse.json({ success: false, message: "Invalid or inactive session" }, { status: 401 })
    }

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process image with sharp to optimize and validate
    const processedImageBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()

    // Generate unique filename
    const fileName = `images/${sessionToken}/${uuidv4()}.jpg`

    // Upload to Firebase Storage
    const file = storage.bucket().file(fileName)
    await file.save(processedImageBuffer, {
      metadata: {
        contentType: "image/jpeg",
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
    console.error("Error uploading image:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

