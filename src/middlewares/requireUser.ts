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
    console.log("req.headers ))))))))))))))))))) >>>>>>>> ", req.headers);
    const rawUser = req.headers['x-user-info'];

    if (!rawUser || typeof rawUser !== 'string') {
      throw AppError.logic("User information is required", 401, httpStatusCode["401_NAME"]);
    }

    // Decode base64 và parse JSON
    const user = JSON.parse(Buffer.from(rawUser, 'base64').toString());
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};