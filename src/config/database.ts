import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

dotenv.config();

// Database configuration - supports both URL and individual parameters
const getDatabaseConfig = () => {
  // If DATABASE_URL is provided (production), use it
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
  
  // Otherwise use individual parameters (local development)
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'obinne_db',
    ssl: false,
  };
};

const isProd = process.env.NODE_ENV === 'production';

// Use compiled JS in production; use TS in development
const entities = isProd
  ? [path.join(process.cwd(), 'dist/entities/**/*.js')]
  : [path.join(process.cwd(), 'src/entities/**/*.ts')];

const migrations = isProd
  ? [path.join(process.cwd(), 'dist/migrations/**/*.js')]
  : [path.join(process.cwd(), 'src/migrations/**/*.ts')];

const subscribers = isProd
  ? [path.join(process.cwd(), 'dist/subscribers/**/*.js')]
  : [path.join(process.cwd(), 'src/subscribers/**/*.ts')];

export const AppDataSource = new DataSource({
  ...getDatabaseConfig(),
  synchronize: process.env.NODE_ENV === 'development', // Only in development!
  logging: process.env.NODE_ENV === 'development',
  entities,
  migrations,
  subscribers,
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    // In production, ensure pending migrations run so tables exist
    if (process.env.NODE_ENV === 'production') {
      await AppDataSource.runMigrations();
    }
    logger.info('Database connection established successfully.');
  } catch (error) {
    logger.error('Error during database initialization:', error);
    process.exit(1);
  }
};
