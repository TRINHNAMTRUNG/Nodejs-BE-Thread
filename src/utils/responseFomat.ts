import { Response } from "express";
import { ResponseT } from "../interfaces";
import { ErrorCode } from "../constants/errorCodes";

export const responseFomat = <DataType, ErrorDetailType>(
    res: Response,
    data: DataType,
    message: string,
    success: boolean = true,
    statusCode: number = 200,
    errorCode?: ErrorCode,
    details?: ErrorDetailType | null
): Response<ResponseT<DataType, ErrorDetailType>> => {
    const response: ResponseT<DataType, ErrorDetailType> = {
        data,
        message,
        success,
        statusCode,
        errorCode,
        details
    };
    return res.status(statusCode).json(response);
};

export class AppError extends Error {
    statusCode: number;
    errorCode?: ErrorCode;
    constructor(message: string, statusCode: number, errorCode?: ErrorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Object.setPrototypeOf(this, new.target.prototype); // Fix prototype chain
    }
}

export const handleError = (error: any, res: Response, strMessage: string, errorCode: ErrorCode) => {
    const isDev = process.env.NODE_ENV === 'development';
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (error instanceof AppError) {
        return responseFomat(
            res,
            null,
            `${strMessage}. Please try again later.`,
            false,
            error.statusCode,
            error.errorCode || errorCode,
            isDev ? { server: [message] } : null
        );
    }
    return responseFomat(
        res,
        null,
        `${strMessage}. Please try again later.`,
        false,
        500,
        errorCode,
        isDev ? { server: [message] } : null
    );
}