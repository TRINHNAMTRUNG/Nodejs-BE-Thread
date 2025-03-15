import Joi, { ObjectSchema } from "joi";

export const createPostSchema: ObjectSchema = Joi.object({
    creator_id: Joi.string().required()
        .messages({
            "*": "Error: Invalid creator_id"
        }),
    reply_to: Joi.string().length(24).hex().optional()
        .messages({
            "*": "Error: Invalid reply_to"
        }),
    content: Joi.string().min(1).required()
        .messages({
            "string.min": "Post content must have at least {#limit} characters.",
            "any.required": "Post content is required."
        }),
    visibility: Joi.string().valid("public", "private", "friends").default("public")
        .messages({
            "any.only": "Error: visibility must be 'public', 'private', or 'friends'."
        }),
    reply_count: Joi.number().integer().min(0).default(0),
    like_count: Joi.number().integer().min(0).default(0),
    comment_count: Joi.number().integer().min(0).default(0),
    save_post_count: Joi.number().integer().min(0).default(0),
    images: Joi.array().items(Joi.string()).optional(),
    user_tags: Joi.array().items(Joi.object({
        id: Joi.string().length(24).hex().required()
            .messages({
                "*": "Error: Invalid user_tags id"
            }),
        name: Joi.string().min(1).max(50).required()
            .messages({
                "string.max": "Error: name cannot exceed {#limit} characters.",
                "any.required": "Error: user_tags name is required."
            }),
    })).optional(),
    hashtags: Joi.array().items(Joi.string().min(1).required()).min(1).optional(),
    poll: Joi.object({
        end_at: Joi.date().required()
            .messages({
                "any.required": "Error: end_at is required."
            }),
        status_poll: Joi.string().valid("Closed", "Openning").default("Openning")
            .messages({
                "any.only": "Error: status_poll must be 'Closed' or 'Openning'."
            }),
        poll_options: Joi.array().items(Joi.object({
            content: Joi.string().required()
                .messages({
                    "any.required": "Error: poll_options content is required."
                }),
            vote_count: Joi.number().min(0).default(0),
            voters: Joi.array()
                .items(Joi.string().length(24).hex())
                .default([])
        })).min(2).messages({
            "array.min": "Error: At least {#limit} options are required in the poll."
        })
    }).optional()
}).unknown(false);

export const updatePostSchema: ObjectSchema = Joi.object({
    content: Joi.string().min(3)
        .messages({
            "string.min": "Post content must have at least {#limit} characters."
        }),
    visibility: Joi.string().valid("public", "private", "friends")
        .messages({
            "any.only": "Error: visibility must be 'public', 'private', or 'friends'."
        }),
}).unknown(false);
