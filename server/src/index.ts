// =============================================================================
// PHANTOM Server — Main Entry Point
// =============================================================================

import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes.js';

export const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[PHANTOM Server Error]:', err);
  res.status(500).json({
    error: 'Internal server error occurred during forensic execution.',
    detail: err?.message,
  });
});

// Start listener only when run directly (not during testing)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[PHANTOM Server] Running on http://127.0.0.1:${PORT}`);
    console.log(`[PHANTOM Server] Forensics API ready at http://127.0.0.1:${PORT}/api`);
  });
}
