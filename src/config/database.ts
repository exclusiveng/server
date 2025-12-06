import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

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

// Determine if we're in production (running compiled JS) or development (running TS)
const isProduction = process.env.NODE_ENV === 'production';
const fileExtension = isProduction ? 'js' : 'ts';
const baseDir = isProduction ? 'dist' : 'src';

export const AppDataSource = new DataSource({
  ...getDatabaseConfig(),
  synchronize: process.env.NODE_ENV === 'development', // Only in development!
  logging: process.env.NODE_ENV === 'development',
  entities: [`${baseDir}/entities/**/*.${fileExtension}`],
  migrations: [`${baseDir}/migrations/**/*.${fileExtension}`],
  subscribers: [`${baseDir}/subscribers/**/*.${fileExtension}`],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
};
