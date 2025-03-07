import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/admin"

export async function GET() {
  try {
    // Check if KLUM is online
    const klumStatusSnapshot = await db.collection("status").doc("klum").get()
    const klumStatus = klumStatusSnapshot.exists ? klumStatusSnapshot.data() : { online: false }

    // Check if there's an active user
    const activeUserSnapshot = await db
      .collection("status")
      .where("role", "==", "user")
      .where("online", "==", true)
      .limit(1)
      .get()

    const hasActiveUser = !activeUserSnapshot.empty

    return NextResponse.json({
      klumOnline: klumStatus.online,
      hasActiveUser,
      chatAvailable: klumStatus.online && !hasActiveUser,
    })
  } catch (error) {
    console.error("Error checking chat status:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

