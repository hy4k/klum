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

// Check if we're in build/static generation time
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

export async function POST(request: Request) {
  // During build time, return a mock response
  if (isBuildTime) {
    console.log('Build time detected - returning mock data for admin auth');
    return NextResponse.json({ 
      success: true,
      adminToken: 'mock-token-for-build-time'
    });
  }

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
    
    if (codesSnapshot.empty) {
      return NextResponse.json({ success: false, message: "Invalid admin code" }, { status: 401 })
    }
    
    const codeDoc = codesSnapshot.docs[0]
    const codeData = codeDoc.data()
    
    if (!codeData?.active) {
      return NextResponse.json({ success: false, message: "Admin code is inactive" }, { status: 401 })
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
