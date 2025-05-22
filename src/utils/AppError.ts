
import { ErrorCode } from "../constants/errorCodes";

export class AppError<ErrorDetailType = undefined> extends Error {
    statusCode: number;
    errorCode: ErrorCode | string;
    isOperational: boolean;
    details?: ErrorDetailType;

    private constructor(
        message: string,
        statusCode: number,
        errorCode: ErrorCode | string,
        details?: ErrorDetailType,
        isOperational: boolean = true,
        stack?: string
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = isOperational;
        this.stack = stack;
        Object.setPrototypeOf(this, new.target.prototype);
    }

    static logic(message: string, statusCode: number, errorCode: ErrorCode | string): AppError {
        return new AppError(message, statusCode, errorCode);
    }

    static validation<T>(message: string, statusCode: number, errorCode: ErrorCode | string, details: T): AppError<T> {
        return new AppError(message, statusCode, errorCode, details);
    }

    static system(message: string, statusCode: number, errorCode: ErrorCode | string, stack?: string): AppError {
        return new AppError(message, statusCode, errorCode, undefined, false, stack);
    }
}