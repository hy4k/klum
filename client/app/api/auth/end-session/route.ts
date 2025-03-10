import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/admin'

export async function POST(request: Request) {
  try {
    const { sessionToken } = await request.json()

    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Session token is required" }, { status: 400 })
    }

    // Update session in database
    await db.collection("sessions").doc(sessionToken).update({
      active: false,
      endedAt: new Date()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error ending session:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

