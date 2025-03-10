import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/firebase/admin'
import type { DocumentSnapshot, DocumentData } from 'firebase-admin/firestore'

interface AdminSession extends DocumentData {
  active: boolean;
  lastActivity: Date;
}

export async function adminAuthMiddleware(request: NextRequest) {
  // Skip auth check for the admin authentication endpoint itself
  if (request.nextUrl.pathname === '/api/admin/auth') {
    return NextResponse.next()
  }

  const adminToken = request.headers.get('x-admin-token')
  
  if (!adminToken) {
    return NextResponse.json({ success: false, message: 'Admin token required' }, { status: 401 })
  }

  try {
    // Check if admin session exists and is active
    const sessionDoc = await db.collection('adminSessions').doc(adminToken).get() as DocumentSnapshot<AdminSession>
    
    if (!sessionDoc.exists || !sessionDoc.data()?.active) {
      return NextResponse.json({ success: false, message: 'Invalid or expired admin session' }, { status: 401 })
    }

    // Update last activity
    await db.collection('adminSessions').doc(adminToken).update({
      lastActivity: new Date()
    })

    return NextResponse.next()
  } catch (error) {
    console.error('Admin auth middleware error:', error)
    return NextResponse.json({ success: false, message: 'Authentication error' }, { status: 500 })
  }
}