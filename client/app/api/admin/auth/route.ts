import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/admin"
import { v4 as uuidv4 } from "uuid"
import type { QuerySnapshot, DocumentData, DocumentReference } from 'firebase-admin/firestore'

interface SecretCode extends DocumentData {
  code: string;
  active: boolean;
  type: 'admin' | 'access';
}

interface AdminSession extends DocumentData {
  active: boolean;
  startedAt: Date;
  lastActivity: Date;
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ success: false, message: "Admin code required" }, { status: 400 })
    }

    // Check if code exists in SecretCodes collection and is admin type
    const codesSnapshot = await db.collection("SecretCodes")
      .where("code", "==", code)
      .where("type", "==", "admin")
      .limit(1)
      .get() as QuerySnapshot<SecretCode>
    
    if (codesSnapshot.empty || !codesSnapshot.docs[0].data()?.active) {
      return NextResponse.json({ success: false, message: "Invalid admin code" }, { status: 401 })
    }

    // Generate admin session token
    const adminToken = uuidv4()

    // Create admin session
    const sessionRef = db.collection("adminSessions").doc(adminToken) as DocumentReference<AdminSession>
    await sessionRef.set({
      active: true,
      startedAt: new Date(),
      lastActivity: new Date()
    })

    return NextResponse.json({ 
      success: true,
      adminToken
    })
  } catch (error) {
    console.error("Error validating admin:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}