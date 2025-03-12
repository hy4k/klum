import { NextResponse } from "next/server"
import { db, storage } from "@/lib/firebase/admin"
import { v4 as uuidv4 } from "uuid"
import sharp from "sharp"

// Session interface for proper type checking
interface Session {
  active: boolean;
  startedAt: Date;
  userName: string;
  // Add other session properties as needed
}

// Check if we're in build/static generation time
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

export async function POST(request: Request) {
  // During build time, return a mock response
  if (isBuildTime) {
    console.log('Build time detected - returning mock data for image upload');
    return NextResponse.json({
      success: true,
      url: 'https://example.com/mock-image.jpg'
    });
  }

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

    // Validate session - updated format
    const sessionSnapshot = await db.collection("sessions").doc(sessionToken).get();
    const sessionData = sessionSnapshot.data() as Session | undefined;
    if (!sessionSnapshot.exists || !sessionData?.active) {
      return NextResponse.json({ success: false, message: "Invalid or inactive session" }, { status: 401 });
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
    const bucket = (storage as any).bucket();
    const file = bucket.file(fileName)
    await file.save(processedImageBuffer, {
      metadata: {
        contentType: "image/jpeg",
      },
    })

    // Make the file publicly accessible
    await file.makePublic()

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

