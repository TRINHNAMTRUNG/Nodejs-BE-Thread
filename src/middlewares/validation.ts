import { Request, Response, NextFunction } from "express";
import { ValidationError, validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { responseFomat } from "../utils/responseFomat";
import { ErrorCode } from "../constants/errorCodes";
import dotenv from "dotenv";
import { AppError } from "../utils/AppError";
import httpStatusCode from "http-status";
dotenv.config();

enum TypeValidate {
    VALIDATE_BODY = "VALIDATE_BODY",
    VALIDATE_QUERY = "VALIDATE_QUERY",
    VALIDATE_PARAM = "VALIDATE_PARAM",
}

const coreValidateAny = (DtoClass: new () => any, typeValidate: TypeValidate) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            let dataSource: any;
            switch (typeValidate) {
                case TypeValidate.VALIDATE_BODY:
                    dataSource = req.body;
                    break;
                case TypeValidate.VALIDATE_QUERY:
                    dataSource = req.query;
                    break;
                case TypeValidate.VALIDATE_PARAM:
                    dataSource = req.params;
                    break;
                default:
                    throw new Error("Invalid validation type");
            }

            if (!dataSource || typeof dataSource !== "object") {
                throw AppError.logic("Invalid request data", httpStatusCode.BAD_REQUEST, httpStatusCode["400_NAME"]);
            }

            const dtoInstance = plainToClass(DtoClass, dataSource, { enableImplicitConversion: true });
            const errorsValidate = await validate(dtoInstance, { validationError: { target: false } });

            if (errorsValidate.length > 0) {
                const details = errorsValidate.reduce((acc, error: ValidationError) => {
                    if (error.constraints) {
                        acc[error.property] = Object.values(error.constraints);
                    } else if (error.children && error.children.length) {
                        const nestedErrors = checkNestedErrors(error);
                        acc[error.property] = nestedErrors;
                    }
                    return acc;
                }, {} as Record<string, any>);

                throw AppError.validation(
                    "Validation failed",
                    httpStatusCode.BAD_REQUEST,
                    ErrorCode.VALIDATION_FAILED,
                    details
                );
            }

            switch (typeValidate) {
                case TypeValidate.VALIDATE_BODY:
                    req.body = dtoInstance;
                    break;
                case TypeValidate.VALIDATE_QUERY:
                    req.query = dtoInstance;
                    break;
                case TypeValidate.VALIDATE_PARAM:
                    req.params = dtoInstance;
                    break;
            }
            next();
        } catch (error: any) {
            console.log("> An error occurred while validating request: ", error);
            next(error);
        }
    };
};

export const validateBodyDto = (DtoClass: new () => any) => {
    return coreValidateAny(DtoClass, TypeValidate.VALIDATE_BODY);
};

export const validateParamDto = (DtoClass: new () => any) => {
    return coreValidateAny(DtoClass, TypeValidate.VALIDATE_PARAM);
};

export const validateQueryDto = (DtoClass: new () => any) => {
    return coreValidateAny(DtoClass, TypeValidate.VALIDATE_QUERY);
};

// Hàm xử lý lỗi nested cho cả object và array
const checkNestedErrors = (error: ValidationError, index?: number): any => {
    // Nếu là lỗi trực tiếp (có constraints)
    if (error.constraints) {
        return {
            ...(index !== undefined && { index }),
            errors: { [error.property]: Object.values(error.constraints) }
        };
    }

    // Nếu có children (nested errors)
    if (error.children && error.children.length > 0) {
        // Kiểm tra xem property có phải là array không
        const isArray = Array.isArray(error.value);

        if (isArray) {
            // Nếu là array, trả về mảng các lỗi với index
            return error.children.map((child: ValidationError, childIndex: number) => {
                if (child.constraints) {
                    return {
                        index: childIndex,
                        errors: { [child.property]: Object.values(child.constraints) }
                    };
                }
                return checkNestedErrors(child, childIndex);
            });
        } else {
            // Nếu là object, trả về object chứa các lỗi
            const nestedErrors: Record<string, any> = {};
            error.children.forEach((child: ValidationError) => {
                if (child.constraints) {
                    nestedErrors[child.property] = Object.values(child.constraints);
                } else if (child.children && child.children.length > 0) {
                    nestedErrors[child.property] = checkNestedErrors(child);
                }
            });
            return nestedErrors;
        }
    }

    return {};
};