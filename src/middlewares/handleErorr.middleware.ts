import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import httpStatus from 'http-status';
import mongoose from "mongoose";
import dotenv from "dotenv";
import { responseFomat } from "../utils/responseFomat";
dotenv.config();

export const errorConverter = <ErrorDetailType>(err: AppError<ErrorDetailType> | Error, req: Request, res: Response, next: NextFunction) => {
    let error = err;
    if (!(error instanceof AppError)) {
        const statusCode = error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        const stack = error.stack ? error.stack : "";
        error = AppError.system(message, statusCode, httpStatus[`${statusCode}_NAME`] || 'SYSTEM_ERROR', stack);
    }
    next(error);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = <ErrorDetailType>(err: AppError<ErrorDetailType>, req: Request, res: Response, next: NextFunction) => {
    let { statusCode, message, errorCode, details } = err;
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production' && !err.isOperational) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    }

    // res.locals.errorMessage = err.message;

    if (nodeEnv === 'development') {
        console.error("Opps My Error ^-^:", err);
    }
    return responseFomat(res, null, message, false, statusCode, errorCode, details);
};


// }