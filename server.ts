import 'dotenv/config';
import express from 'express';
import path from 'path';
import app from './api/index.js';

const rootDir = process.cwd();
const PORT = process.env.PORT || 4000;

app.use(express.static(path.join(rootDir, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
