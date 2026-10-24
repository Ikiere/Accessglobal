import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.url} - Status ${statusCode}:`, err);

  res.status(statusCode).json({
    error: message,
    statusCode,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};
