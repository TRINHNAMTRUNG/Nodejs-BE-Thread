import { Response } from "express";
import { ResponseT } from "./customResponse";
import { ErrorCode } from "../constants/errorCodes";

export const responseFomat = <DataType, ErrorDetailType>(
    res: Response,
    data: DataType,
    message: string,
    success: boolean = true,
    statusCode: number = 200,
    errorCode?: ErrorCode | string,
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