import { Request } from "express";

/**
 * Extend Express Request to include userId
 * when authenticated by middleware.
 */
export interface AuthenticatedRequest extends Request {
  userId: number;
}

declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}