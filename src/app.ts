import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { sanitizeInput } from './middleware/validation.middleware';
import logger, { stream } from './utils/logger';

dotenv.config();

const app: Application = express();

// Respect X-Forwarded-* headers when behind a proxy (e.g., Render, Heroku)
// Needed for accurate rate limiting and client IP detection.
app.set('trust proxy', 1);

// HTTP request logger
app.use(morgan('dev', { stream }));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://obinne-frontend-blond.vercel.app',
      'https://obinne-frontend-blond.vercel.app/'
    ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware with security configurations
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    abortOnLimit: true,
    responseOnLimit: 'File size exceeds the 5MB limit',
    useTempFiles: false,
    safeFileNames: true,
    preserveExtension: true,
    createParentPath: true,
    parseNested: true,
  })
);

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Input sanitization
app.use(sanitizeInput);

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

logger.info('Application setup complete.');

export default app;
