import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role?: string;
      };
      dvUser?: any; // Add this line to include the dbUser property
    }
  }
}