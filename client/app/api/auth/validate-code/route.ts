import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/admin'
import { v4 as uuidv4 } from 'uuid'
import type { DocumentSnapshot, DocumentData, DocumentReference } from 'firebase-admin/firestore'

interface SecretCode extends DocumentData {
  code: string;
  active: boolean;
  inUse: boolean;
  lastUsed: Date | null;
}

interface Session extends DocumentData {
  code: string;
  active: boolean;
  startedAt: Date;
  lastActivity: Date;
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ success: false, message: "Code is required" }, { status: 400 })
    }

    // Check if code exists and is valid in SecretCodes collection
    const codeRef = db.collection("SecretCodes").doc(code) as DocumentReference<SecretCode>
    const codeSnapshot = await codeRef.get() as DocumentSnapshot<SecretCode>
    
    if (!codeSnapshot.exists || !codeSnapshot.data()?.active) {
      return NextResponse.json({ success: false, message: "Invalid or inactive code" }, { status: 401 })
    }

    // Generate session token
    const sessionToken = uuidv4()

    // Create a new session
    const session: Session = {
      code,
      active: true,
      startedAt: new Date(),
      lastActivity: new Date()
    }

    const sessionRef = db.collection("sessions").doc(sessionToken) as DocumentReference<Session>
    await sessionRef.set(session)

    // Mark code as in use
    await codeRef.update({
      inUse: true,
      lastUsed: new Date()
    })

    return NextResponse.json({ 
      success: true,
      sessionToken 
    })
  } catch (error) {
    console.error("Error validating code:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

