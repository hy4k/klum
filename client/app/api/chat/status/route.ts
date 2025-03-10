import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/admin"

// സ്റ്റാറ്റിക് എക്സ്പോർട്ടിനായി ഈ റൂട്ട് ഫോഴ്സ് ഡൈനാമിക് ആയി സെറ്റ് ചെയ്യുന്നു
export const dynamic = "force-static";
export const revalidate = 0;

export async function GET() {
  try {
    // Get KLUM's presence status
    const klumPresenceRef = db.collection("presence").doc("klum")
    const klumSnapshot = await klumPresenceRef.get()
    const klumStatus = klumSnapshot.data()

    // Check if any user is active
    const userPresenceSnapshot = await db.collection("presence")
      .where("role", "==", "user")
      .where("online", "==", true)
      .limit(1)
      .get()
    
    const hasActiveUser = !userPresenceSnapshot.empty

    return NextResponse.json({
      klumOnline: klumStatus?.online ?? false,
      hasActiveUser,
      chatAvailable: (klumStatus?.online ?? false) && !hasActiveUser,
    })
  } catch (error) {
    console.error("Error checking chat status:", error)
    return NextResponse.json({ error: "Failed to check chat status" }, { status: 500 })
  }
}

