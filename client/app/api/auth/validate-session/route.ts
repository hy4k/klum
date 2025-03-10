import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/admin'

export async function POST(request: Request) {
  try {
    const { sessionToken } = await request.json()

    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Session token is required" }, { status: 400 })
    }

    // Validate session
    const sessionSnapshot = await db.collection("sessions").doc(sessionToken).get()
    if (!sessionSnapshot.exists || !sessionSnapshot.data()?.active) {
      return NextResponse.json({ success: false, message: "Invalid or inactive session" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error validating session:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

