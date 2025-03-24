import { Response } from "express";
import { ResponseT } from "../interfaces";
export const responseFomat = <T>(
    res: Response,
    data: T,
    message: string,
    success: boolean = true,
    statusCode: number = 200,
    error?: string | string[]
): Response<ResponseT<T>> => {
    const response: ResponseT<T> = {
        data,
        statusCode,
        success,
        message,
        error
    };
    return res.status(statusCode).json(response);
};

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype); // Fix prototype chain
    }
}
