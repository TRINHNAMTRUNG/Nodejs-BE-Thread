import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { responseFomat } from "../utils/responseFomat";

export const validate = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            return responseFomat(res, null, "Validation Error", false, 401, error.details.map(err => err.message));
        }
        next();
    };
};

export const validateQueryParams = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.query, { abortEarly: false, convert: true });
        if (error) {
            return responseFomat(res, null, "Validation Error", false, 401, error.details.map(err => err.message));
        }
        req.query = value;
        next();
    }
}
