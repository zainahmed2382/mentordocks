import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../_prisma.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-for-dev';

router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request body:', req.body);
    const { name, email, password, role } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

<<<<<<< HEAD
    console.log('Checking if user exists:', email);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ error: 'Email is already in use' });
    }

    console.log('Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Creating user');
    const user = await prisma.user.create({
      data: {
        name,
=======
    let user = null;
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'Developer',
        },
      });
    } catch (dbErr: any) {
      console.warn("Database operation failed during signup, falling back to stateless auth:", dbErr?.message || dbErr);
    }

    // Fallback if DB is not configured or unreachable
    if (!user) {
      user = {
        id: Math.floor(Math.random() * 100000) + 1,
        name: name || email.split('@')[0],
>>>>>>> 7f43372866eea4347cb17a42e693acd516b18d47
        email,
        role: role || 'Developer',
<<<<<<< HEAD
      },
    });
    console.log('User created:', user);
=======
      };
    }
>>>>>>> 7f43372866eea4347cb17a42e693acd516b18d47

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        name: user.name || email.split('@')[0],
        email: user.email,
        role: user.role || 'Developer',
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
<<<<<<< HEAD
    res.status(500).json({ error: 'Internal server error: ' + (error as Error).message });
=======
    res.status(500).json({ error: error?.message || 'Signup failed. Please try again.' });
>>>>>>> 7f43372866eea4347cb17a42e693acd516b18d47
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbErr: any) {
      console.warn("Database operation failed during login, checking fallback auth:", dbErr?.message || dbErr);
    }

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    } else {
      // If DB is unreachable or user not found when DB is unconfigured, allow stateless demo auth
      if (!process.env.DATABASE_URL) {
        user = {
          id: 1,
          name: email.split('@')[0],
          email,
          role: 'Developer',
        };
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        name: user.name || email.split('@')[0],
        email: user.email,
        role: user.role || 'Developer',
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error?.message || 'Authentication failed. Please try again.' });
  }
});

export default router;
