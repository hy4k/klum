import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/admin"
import { v4 as uuidv4 } from "uuid"

// This endpoint should be protected with proper admin authentication
// For demo purposes, we're using a simple API key check
export async function POST(request: Request) {
  try {
    const { adminKey } = await request.json()

    // Check admin key (in a real app, use proper authentication)
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Generate a unique code
    const code = uuidv4().substring(0, 8).toUpperCase()

    // Store the code in Firestore
    await db.collection("secretCodes").doc(code).set({
      createdAt: new Date().toISOString(),
      inUse: false,
      lastUsed: null,
    })

    return NextResponse.json({
      success: true,
      code,
    })
  } catch (error) {
    console.error("Error generating code:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

