import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { db } from "@/lib/firebase-admin"
import type { DocumentData } from 'firebase-admin/firestore'
import * as FirebaseFirestore from 'firebase-admin/firestore'

interface AdminSession extends DocumentData {
  active: boolean;
  createdAt: Date;
  lastActivity: Date;
  adminId: string;
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
    const adminSessionDoc = await db.collection("adminSessions").doc(adminToken).get() as FirebaseFirestore.DocumentSnapshot<AdminSession>;
    
    const adminSessionData = adminSessionDoc.data();
    
    if (!adminSessionDoc.exists || !adminSessionData?.active) {
      return NextResponse.json(
        { success: false, message: "Invalid admin session" },
        { status: 401 }
      );
    }

    // Get all admin sessions
    const sessionsSnapshot = await db.collection("adminSessions").orderBy("createdAt", "desc").get();
    
    const sessions = sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Update last activity time
    await adminSessionDoc.ref.update({
      lastActivity: new Date(),
    });

    return NextResponse.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error("Error listing admin sessions:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
