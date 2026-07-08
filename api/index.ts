import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './_auth/index.js';
import auditRouter from './audit.js';
import auditsRouter from './audits.js';
import healthRouter from './_health.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/audit', auditRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/health', healthRouter);

export default app;
