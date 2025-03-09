import { NextApiRequest, NextApiResponse } from 'next';
import { admin } from "@/lib/firebase/admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { uid } = req.body;
    try {
      await admin.auth().revokeRefreshTokens(uid);
      res.status(200).send({ message: 'Session ended successfully' });
    } catch (error) {
      res.status(500).send({ error: 'Failed to end session' });
    }
  } else {
    res.status(405).send({ error: 'Method not allowed' });
  }
}

