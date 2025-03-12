"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Loader2, Copy, Check, Activity, Database, Users, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { auth, db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { collection, getDocs, getDoc, doc, query, orderBy, limit, where, setDoc, addDoc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

interface SiteStatus {
  secretCodesCount: number;
  messagesCount: number;
  sessionsCount: number;
}

interface SystemTest {
  name: string;
  status: 'running' | 'success' | 'error';
  message?: string;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<SiteStatus | null>(null);
  const [systemTests, setSystemTests] = useState<SystemTest[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // First try to get stored admin token
        const storedToken = localStorage.getItem('adminToken');
        if (storedToken) {
          setAdminToken(storedToken);
          await fetchAdminData(storedToken);
          return;
        }

        // If no stored token, prompt for admin code
        const secretCode = prompt("Enter admin secret code:");
        if (!secretCode) {
          setError("Admin code required");
          return;
        }

        // Authenticate with admin code
        const response = await fetch("/api/admin/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: secretCode }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Invalid admin code");
        }

        // Store admin token
        localStorage.setItem('adminToken', data.adminToken);
        setAdminToken(data.adminToken);
        
        // Fetch admin data with new token
        await fetchAdminData(data.adminToken);

      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    checkAdmin();
  }, []);

  const fetchAdminData = async (token: string) => {
    try {
      // Fetch collection counts
      const [secretCodesSnapshot, messagesSnapshot, sessionsSnapshot] = await Promise.all([
        getDocs(collection(db, "SecretCodes")),
        getDocs(collection(db, "messages")),
        getDocs(collection(db, "sessions"))
      ]);

      setStatus({
        secretCodesCount: secretCodesSnapshot.docs.length,
        messagesCount: messagesSnapshot.docs.length,
        sessionsCount: sessionsSnapshot.docs.length
      });

      // Fetch recent messages
      const recentMsgsQuery = query(
        collection(db, "messages"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const recentMsgsSnapshot = await getDocs(recentMsgsQuery);
      
      setRecentMessages(recentMsgsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      })));

      // Fetch active sessions
      const activeSessionsQuery = query(
        collection(db, "sessions"),
        where("active", "==", true)
      );
      const activeSessSnapshot = await getDocs(activeSessionsQuery);
      
      setActiveSessions(activeSessSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      })));

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleGenerateCode = async () => {
    if (!adminKey || !adminToken) {
      setError("Admin key is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify({ adminKey }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate code")
      }

      setGeneratedCode(data.code)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const runSystemTest = async (testName: string) => {
    setSystemTests(prev => [...prev, { name: testName, status: 'running' }]);
    
    try {
      // Simulate different system tests
      switch (testName) {
        case 'Database Connection':
          await setDoc(doc(db, "status", "test"), {
            timestamp: new Date()
          });
          break;
        case 'Authentication':
          // Test authentication system by checking current auth state
          const currentUser = auth.currentUser;
          if (!currentUser) {
            throw new Error('No authenticated user');
          }
          break;
        case 'Chat System':
          await addDoc(collection(db, "messages"), {
            content: "Test message",
            timestamp: new Date(),
            type: "test"
          });
          break;
      }

      setSystemTests(prev => 
        prev.map(test => 
          test.name === testName 
            ? { ...test, status: 'success', message: 'Test completed successfully' }
            : test
        )
      );
    } catch (err) {
      setSystemTests(prev => 
        prev.map(test => 
          test.name === testName 
            ? { ...test, status: 'error', message: err instanceof Error ? err.message : 'Test failed' }
            : test
        )
      );
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 to-black p-8">
        <Card className="max-w-md mx-auto bg-black/50 text-white border-red-500">
          <CardHeader>
            <CardTitle className="text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-800 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="bg-black/40 backdrop-blur-md border border-purple-500 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Crown className="h-12 w-12 text-amber-400" />
            </div>
            <CardTitle className="text-2xl text-amber-300">KLUMSI-LAND Admin</CardTitle>
            <CardDescription className="text-blue-200">System Administration and Monitoring</CardDescription>
          </CardHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-blue-950/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="testing">System Tests</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-950/30 border-blue-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Database className="h-4 w-4 mr-2 text-blue-400" />
                        Secret Codes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-300">{status?.secretCodesCount || 0}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-950/30 border-blue-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <MessageCircle className="h-4 w-4 mr-2 text-green-400" />
                        Messages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-300">{status?.messagesCount || 0}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-950/30 border-blue-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Users className="h-4 w-4 mr-2 text-amber-400" />
                        Active Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-300">{status?.sessionsCount || 0}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold text-blue-200">Generate Access Code</h3>
                  <div className="space-y-2">
                    <Input
                      id="adminKey"
                      type="password"
                      placeholder="Enter admin key"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      className="bg-blue-950/50 border-blue-700 text-white"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">{error}</div>
                  )}

                  {generatedCode && (
                    <div className="p-4 bg-green-900/30 border border-green-700 rounded-md">
                      <div className="text-sm text-green-200 mb-2">Generated Code:</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-mono text-green-100 tracking-wider">{generatedCode}</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyCode}
                          className="text-green-200 hover:text-green-100 hover:bg-green-800/30"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateCode}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Secret Code"
                    )}
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="testing">
              <CardContent>
                <div className="space-y-6">
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => runSystemTest('Database Connection')}
                      variant="outline"
                      className="border-blue-600 text-blue-200 hover:bg-blue-900/50"
                    >
                      Test Database
                    </Button>
                    <Button
                      onClick={() => runSystemTest('Authentication')}
                      variant="outline"
                      className="border-green-600 text-green-200 hover:bg-green-900/50"
                    >
                      Test Auth
                    </Button>
                    <Button
                      onClick={() => runSystemTest('Chat System')}
                      variant="outline"
                      className="border-amber-600 text-amber-200 hover:bg-amber-900/50"
                    >
                      Test Chat
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-blue-300">Test</TableHead>
                        <TableHead className="text-blue-300">Status</TableHead>
                        <TableHead className="text-blue-300">Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemTests.map((test, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium text-white">{test.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                test.status === 'running' ? 'default' :
                                test.status === 'success' ? 'secondary' :
                                'destructive'
                              }
                            >
                              {test.status === 'running' && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                              {test.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400">{test.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="messages">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-blue-300">Sender</TableHead>
                      <TableHead className="text-blue-300">Message</TableHead>
                      <TableHead className="text-blue-300">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMessages.map((msg, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-white">{msg.sender}</TableCell>
                        <TableCell className="text-gray-300">{msg.content}</TableCell>
                        <TableCell className="text-gray-400">
                          {msg.timestamp?.toDate().toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </TabsContent>

            <TabsContent value="sessions">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-blue-300">User</TableHead>
                      <TableHead className="text-blue-300">Status</TableHead>
                      <TableHead className="text-blue-300">Started At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((session, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-white">{session.userName}</TableCell>
                        <TableCell>
                          <Badge variant={session.active ? 'default' : 'secondary'}>
                            {session.active ? 'Active' : 'Ended'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {session.startedAt?.toDate().toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

