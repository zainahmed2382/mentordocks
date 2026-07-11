import 'dotenv/config';
import express from 'express';
import authRouter from './_auth/index.js';
import auditRouter from './audit.js';
import auditsRouter from './audits.js';
import healthRouter from './_health.js';

const app = express();

// Native zero-dependency CORS middleware (prevents Vercel Cannot find package 'cors' errors)
app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/audit', auditRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/health', healthRouter);

// 404 JSON fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Global error handler to prevent serverless function crashes
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

export default app;
