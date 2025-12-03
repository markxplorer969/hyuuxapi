import { readFileSync } from 'fs';
import { join } from 'path';

// Load metadata.json
let metadata = {};
try {
  const metadataPath = join(process.cwd(), 'config.json');
  metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
} catch (err) {
  console.warn('Warning: config.json not found, using defaults');
}

// Load endpoints.json
let endpoints = {};
try {
  const endpointsPath = join(process.cwd(), 'endpoints.json');
  endpoints = JSON.parse(readFileSync(endpointsPath, 'utf-8'));
} catch (err) {
  console.warn('Warning: endpoints.json not found');
}

export const config = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Creator Information
  creator: metadata.creator,
  whatsapp: metadata.whatsapp,
  github: metadata.github,
  youtube: metadata.youtube,
  
  // API Branding
  apiTitle: metadata.apititle,
  favicon: metadata.favicon,
  
  // Endpoints
  endpoints: endpoints,
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30')
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};