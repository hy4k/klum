import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/firebase-admin";

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