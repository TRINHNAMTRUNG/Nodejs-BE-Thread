import { ErrorCode } from "../constants/errorCodes";
export interface ResponseT<DataType, ErrorDetailType> {
    data: DataType;
    statusCode: number;
    success: boolean;
    message: string
    errorCode?: ErrorCode | string,
    details?: ErrorDetailType | string | null;
}
