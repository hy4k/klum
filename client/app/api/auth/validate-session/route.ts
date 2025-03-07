import { admin } from '@/lib/firebase/admin';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { sessionToken } = req.body;
    try {
      const decodedToken = await admin.auth().verifyIdToken(sessionToken);
      res.status(200).send({ uid: decodedToken.uid });
    } catch (error) {
      res.status(500).send({ error: 'Invalid session token' });
    }
  } else {
    res.status(405).send({ error: 'Method not allowed' });
  }
}

