import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from './_prisma.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-for-dev';

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get user's audit history
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const audits = await prisma.audit.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
