
import Joi, { ObjectSchema } from "joi";

export const idQuerySchema: ObjectSchema = Joi.object({
    id: Joi.string().length(24).hex().required()
        .messages({
            "*": "Invalid id parameter"
        }),
})

export const votePostSchema: ObjectSchema = Joi.object({
    user_id: Joi.string().length(24).hex().required()
        .messages({
            "*": "Invalid user_id"
        }),
});