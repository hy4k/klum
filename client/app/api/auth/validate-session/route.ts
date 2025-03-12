import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/admin'
import { DocumentSnapshot } from 'firebase-admin/firestore'

interface Session {
  active: boolean;
  startedAt: Date;
  userName: string;
  // Add other session properties as needed
}

export async function POST(request: Request) {
  try {
    const { sessionToken } = await request.json()

    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Session token is required" }, { status: 400 })
    }

    // Validate session
    const sessionSnapshot = await db.collection("sessions").doc(sessionToken).get() as DocumentSnapshot<Session>;
    
    const sessionData = sessionSnapshot.data();
    if (!sessionSnapshot.exists || !sessionData?.active) {
      return NextResponse.json({ success: false, message: "Invalid or inactive session" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error validating session:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

