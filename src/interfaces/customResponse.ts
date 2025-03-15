export interface ResponseT<T> {
    data: T;
    statusCode: number;
    success: boolean;
    error?: string | string[];
    message: string
}
