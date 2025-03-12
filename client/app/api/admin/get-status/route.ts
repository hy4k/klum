import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { DocumentData } from 'firebase-admin/firestore';
import * as FirebaseFirestore from 'firebase-admin/firestore';

interface AdminSession extends DocumentData {
  active: boolean;
  createdAt: Date;
  lastActivity: Date;
  adminId: string;
}

// Check if we're in build/static generation time
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

export async function GET(request: NextRequest) {
  // During build time, return a mock response
  if (isBuildTime) {
    console.log('Build time detected - returning mock data for admin status');
    return NextResponse.json({
      success: true,
      status: {
        secretCodesCount: 0,
        messagesCount: 0,
        sessionsCount: 0,
      }
    });
  }

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
    const adminSessionDoc = await db.collection("adminSessions").doc(adminToken).get() as FirebaseFirestore.DocumentSnapshot<AdminSession>;
    
    const adminSessionData = adminSessionDoc.data();
    
    if (!adminSessionDoc.exists || !adminSessionData?.active) {
      return NextResponse.json(
        { success: false, message: "Invalid admin session" },
        { status: 401 }
      );
    }

    // Get collection counts
    const [secretCodesSnapshot, messagesSnapshot, sessionsSnapshot] = await Promise.all([
      db.collection("SecretCodes").get(),
      db.collection("messages").get(),
      db.collection("sessions").get(),
    ]);

    // Update last activity time
    await adminSessionDoc.ref.update({
      lastActivity: new Date(),
    });

    return NextResponse.json({
      success: true,
      status: {
        secretCodesCount: secretCodesSnapshot.size,
        messagesCount: messagesSnapshot.size,
        sessionsCount: sessionsSnapshot.size,
      }
    });
  } catch (error) {
    console.error("Error getting admin status:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}