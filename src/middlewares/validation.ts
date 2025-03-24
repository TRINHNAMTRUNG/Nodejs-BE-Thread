import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { responseFomat } from "../utils/responseFomat";

export const validateBody = (schema: ObjectSchema, options: { allowUnknown?: boolean } = {}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // console.log("Kiem tra middle before: ", req.body)
        try {
            // If no body is provided when it's required, return error early
            if (Object.keys(req.body || {}).length === 0 && !options.allowUnknown) {
                return responseFomat(
                    res,
                    null,
                    "Validation Error",
                    false,
                    400,
                    "Request body is required"
                );
            }

            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: !options.allowUnknown,
                convert: true
            });

            if (error) {
                const errorMessages = error.details.map(err => {
                    console.log("Kiem tra joi: ", err.message)
                    const message = err.message.startsWith("Error:")
                        ? err.message
                        : `Error: ${err.message}`;
                    return message;
                });

                return responseFomat(
                    res,
                    null,
                    "Validation Error",
                    false,
                    400,
                    errorMessages
                );
            }
            req.body = value;
            console.log("Kiem tra middle after: ", req.body)
            next();
        } catch (err) {
            console.error("Validation middleware error:", err);
            return responseFomat(
                res,
                null,
                "Internal Server Error",
                false,
                500,
                "An error occurred while validating request"
            );
        }
    };
};

/**
 * Middleware to validate query parameters against a Joi schema
 * @param schema Joi validation schema
 */
export const validateQueryParams = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value } = schema.validate(req.query, {
                abortEarly: false,
                convert: true,
                stripUnknown: false
            });

            if (error) {
                const errorMessages = error.details.map(err => `Error: ${err.message}`);
                return responseFomat(
                    res,
                    null,
                    "Invalid Query Parameters",
                    false,
                    400,
                    errorMessages
                );
            }

            // Replace req.query with validated values
            req.query = value;
            next();
        } catch (err) {
            console.error("Query validation middleware error:", err);
            return responseFomat(
                res,
                null,
                "Internal Server Error",
                false,
                500,
                "An error occurred while validating query parameters"
            );
        }
    };
};

/**
 * Middleware to validate URL parameters against a Joi schema
 * @param schema Joi validation schema
 */
export const validateParams = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value } = schema.validate(req.params, {
                abortEarly: false,
                convert: true
            });

            if (error) {
                const errorMessages = error.details.map(err => `Error: ${err.message}`);
                return responseFomat(
                    res,
                    null,
                    "Invalid URL Parameters",
                    false,
                    400,
                    errorMessages
                );
            }

            // Replace req.params with validated values
            req.params = value;
            next();
        } catch (err) {
            console.error("Params validation middleware error:", err);
            return responseFomat(
                res,
                null,
                "Internal Server Error",
                false,
                500,
                "An error occurred while validating URL parameters"
            );
        }
    };
};
