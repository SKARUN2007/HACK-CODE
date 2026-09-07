import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import evidenceRouter from './routes/evidence';
import verificationsRouter from './routes/verifications';
import authorityRouter from './routes/authority';
import adminAuditRouter from './routes/adminAudit';
import adminSecurityRouter from './routes/adminSecurity';
import { globalRateLimiter, authRateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static File Serving for Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

import civicReportsRouter from './routes/civicReports';
import authorityDirectoryRouter from './routes/authorityDirectory';
import civicMapRouter from './routes/civicMap';
import inspectionRoutesRouter from './routes/inspectionRoutes';
import crossDomainRouter from './routes/crossDomainRoutes';
import contractorSubmissionsRouter from './routes/contractorSubmissions';

// Global Rate Limiting
app.use(globalRateLimiter);

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRateLimiter, authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/contractor', contractorSubmissionsRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/verifications', verificationsRouter);
app.use('/api/authority/civic-map', civicMapRouter);
app.use('/api/authority/inspection-routes', inspectionRoutesRouter);
app.use('/api/authority', authorityRouter);
app.use('/api/civic-reports', civicReportsRouter);
app.use('/api/cross-domain', crossDomainRouter);
app.use('/api/authority-directory', authorityDirectoryRouter);
app.use('/api/admin/audit', adminAuditRouter);
app.use('/api/admin/security', adminSecurityRouter);


// 404 Route Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Centralized Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(500).json({ error: 'Internal Server Error.' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  MAKKALSAANTRU API Server running on port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
}

export default app;
