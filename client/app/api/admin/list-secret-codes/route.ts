import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { db } from "@/lib/firebase-admin"
import type { DocumentData } from 'firebase-admin/firestore'

interface SecretCode extends DocumentData {
  code: string;
  active: boolean;
  inUse: boolean;
  createdAt: Date;
  lastUsed: Date | null;
  type: 'access' | 'admin';
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin token from headers
    const adminToken = request.headers.get("x-admin-token");
    
    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "Admin token required" },
        { status: 401 }
      );
    }

    // Verify admin session
    const adminSessionDoc = await db.collection("adminSessions").doc(adminToken).get();
    
    if (!adminSessionDoc.exists || !adminSessionDoc.data()?.active) {
      return NextResponse.json(
        { success: false, message: "Invalid admin session" },
        { status: 401 }
      );
    }

    // Get all secret codes
    const codesSnapshot = await db.collection("SecretCodes").orderBy("createdAt", "desc").get();
    
    const codes = codesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Update last activity time
    await adminSessionDoc.ref.update({
      lastActivity: new Date(),
    });

    return NextResponse.json({
      success: true,
      codes
    });
  } catch (error) {
    console.error("Error listing secret codes:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}