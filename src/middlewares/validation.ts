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
                    dataSource = req.body
                    break;
                case TypeValidate.VALIDATE_QUERY:
                    dataSource = req.query
                    break;
                case TypeValidate.VALIDATE_PARAM:
                    dataSource = req.params
                    break;
                default:
                    throw new Error('Invalid validation type');
            }

            if (!dataSource || typeof dataSource !== 'object') {
                throw AppError.logic("Invalid request data", httpStatusCode.BAD_REQUEST, httpStatusCode["400_NAME"]);
            }

            const dtoInstance = plainToClass(DtoClass, dataSource);
            // console.log("LOGS VALIDATE: ", dtoInstance)
            const errorsValidate = await validate(dtoInstance);

            if (errorsValidate.length > 0) {
                const details = errorsValidate.reduce((acc, error: ValidationError) => {
                    acc[error.property] = Object.values(error.constraints || {});
                    return acc;
                }, {} as Record<string, string[]>);
                throw AppError.validation("Validation failed", httpStatusCode.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, details);
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
            console.log('> An error occurred while validating request: ', error);
            next(error);
        }
    }
}

export const validateBodyDto = (DtoClass: new () => any) => {
    return coreValidateAny(DtoClass, TypeValidate.VALIDATE_BODY);
}
export const validateParamDto = (DtoClass: new () => any) => {
    return coreValidateAny(DtoClass, TypeValidate.VALIDATE_PARAM);
}
export const validateQueryDto = (DtoClass: new () => any) => {
    return coreValidateAny(DtoClass, TypeValidate.VALIDATE_QUERY);
}

// export const validateBody = (schema: Joi.AnySchema, options: { allowUnknown?: boolean } = {}) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         // console.log("Kiem tra middle before: ", req.body)
//         try {
//             // If no body is provided when it's required, return error early
//             if (Object.keys(req.body || {}).length === 0 && !options.allowUnknown) {
//                 return responseFomat(
//                     res,
//                     null,
//                     "Validation Error",
//                     false,
//                     400,
//                     "Request body is required"
//                 );
//             }

//             const { error, value } = schema.validate(req.body, {
//                 abortEarly: false,
//                 stripUnknown: !options.allowUnknown,
//                 convert: true
//             });

//             if (error) {
//                 const errorMessages = error.details.map(err => {
//                     console.log("Kiem tra joi: ", err.message)
//                     const message = err.message.startsWith("Error:")
//                         ? err.message
//                         : `Error: ${err.message}`;
//                     return message;
//                 });

//                 return responseFomat(
//                     res,
//                     null,
//                     "Validation Error",
//                     false,
//                     400,
//                     errorMessages
//                 );
//             }
//             req.body = value;
//             console.log("Kiem tra middle after: ", req.body)
//             next();
//         } catch (err) {
//             console.error("Validation middleware error:", err);
//             return responseFomat(
//                 res,
//                 null,
//                 "Internal Server Error",
//                 false,
//                 500,
//                 "An error occurred while validating request"
//             );
//         }
//     };
// };

// /**
//  * Middleware to validate query parameters against a Joi schema
//  * @param schema Joi validation schema
//  */
// export const validateQueryParams = (schema: ObjectSchema) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const { error, value } = schema.validate(req.query, {
//                 abortEarly: false,
//                 convert: true,
//                 allowUnknown: false
//             });

//             if (error) {
//                 const errorMessages = error.details.map(err => `Error: ${err.message}`);
//                 return responseFomat(
//                     res,
//                     null,
//                     "Invalid Query Parameters",
//                     false,
//                     400,
//                     errorMessages
//                 );
//             }

//             // Replace req.query with validated values
//             req.query = value;
//             next();
//         } catch (err) {
//             console.error("Query validation middleware error:", err);
//             return responseFomat(
//                 res,
//                 null,
//                 "Internal Server Error",
//                 false,
//                 500,
//                 "An error occurred while validating query parameters"
//             );
//         }
//     };
// };

// /**
//  * Middleware to validate URL parameters against a Joi schema
//  * @param schema Joi validation schema
//  */
// export const validateParams = (schema: ObjectSchema) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const { error, value } = schema.validate(req.params, {
//                 abortEarly: false,
//                 convert: true
//             });

//             if (error) {
//                 const errorMessages = error.details.map(err => `Error: ${err.message}`);
//                 return responseFomat(
//                     res,
//                     null,
//                     "Invalid URL Parameters",
//                     false,
//                     400,
//                     errorMessages
//                 );
//             }

//             // Replace req.params with validated values
//             req.params = value;
//             next();
//         } catch (err) {
//             console.error("Params validation middleware error:", err);
//             return responseFomat(
//                 res,
//                 null,
//                 "Internal Server Error",
//                 false,
//                 500,
//                 "An error occurred while validating URL parameters"
//             );
//         }
//     };
// };
