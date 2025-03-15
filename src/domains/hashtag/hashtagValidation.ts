import { query } from "express";
import Joi from "joi";

export const createHashtagSchema = Joi.object({
    name: Joi.string().required()
        .messages({
            "*": "Error: Name hashtag không hợp lệ"
        }),
});

export const recommendHashtagSchema = Joi.object({
    limit: Joi.number().integer().min(1).required()
        .messages({
            "*": "Error: Invalid limit"
        }),
    query: Joi.string().min(1).required()
        .messages({
            "*": "Error: Invalid query"
        })

})

export const updateHashtagSchema = Joi.object({
    id: Joi.string().length(24).hex().required()
        .messages({
            "*": "Error: id hashtag không hợp lệ"
        })
})

