import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import httpStatusCode from "http-status";

declare module "express-serve-static-core" {
  interface Request {
    user?: Record<string, any>;
  }
}

// Middleware
export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawUser = req.headers['x-user-info'];

    if (!rawUser || typeof rawUser !== 'string') {
      throw AppError.logic("User information is required", 401, httpStatusCode["401_NAME"]);
    }

    const user = JSON.parse(rawUser);
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};