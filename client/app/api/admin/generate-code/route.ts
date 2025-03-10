import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/admin"
import { v4 as uuidv4 } from "uuid"
import type { DocumentData, DocumentReference } from 'firebase-admin/firestore'

interface SecretCode extends DocumentData {
  code: string;
  active: boolean;
  inUse: boolean;
  createdAt: Date;
  lastUsed: Date | null;
  type: 'access' | 'admin';
}

// This endpoint should be protected with proper admin authentication
// For demo purposes, we're using a simple API key check
export async function POST(request: Request) {
  try {
    const { adminKey } = await request.json()

    // Check admin key (in a real app, use proper authentication)
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Generate a unique document ID and code
    const docId = uuidv4()
    const code = Math.random().toString().substring(2, 8) // 6-digit numeric code

    // Store the code in SecretCodes collection
    const secretCode: SecretCode = {
      code,
      active: true,
      inUse: false,
      createdAt: new Date(),
      lastUsed: null,
      type: "access"
    }

    const codeRef = db.collection("SecretCodes").doc(docId) as DocumentReference<SecretCode>
    await codeRef.set(secretCode)

    return NextResponse.json({
      success: true,
      code,
    })
  } catch (error) {
    console.error("Error generating code:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

