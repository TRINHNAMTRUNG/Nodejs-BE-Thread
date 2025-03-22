import Joi, { ObjectSchema } from "joi";

export const createPostSchema: ObjectSchema = Joi.object({
    creator_id: Joi.string().length(24).hex().required()
        .messages({
            "*": "Error: Invalid creator_id"
        }),
    // reply_to: Joi.string().length(24).hex().optional()
    //     .messages({
    //         "*": "Error: Invalid reply_to"
    //     }),
    content: Joi.string().min(1).required()
        .messages({
            "string.min": "Error: Post content must have at least {#limit} characters.",
            "any.required": "Error: Post content is required."
        }),
    visibility: Joi.string().valid("public", "private", "friends").default("public")
        .messages({
            "any.only": "Error: visibility must be 'public', 'private', or 'friends'."
        }),
    // reply_count: Joi.number().integer().min(0).default(0),
    like_count: Joi.number().integer().min(0).default(0),
    comment_count: Joi.number().integer().min(0).default(0),
    save_post_count: Joi.number().integer().min(0).default(0),
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
    hashtags: Joi.array()
        .items(Joi.string().min(1).required().messages({
            "string.base": "Each hashtag must be a string.",
            "string.empty": "Hashtag cannot be empty.",
            "any.required": "Hashtag is required."
        }))
        .min(1)
        .messages({
            "array.min": "At least one hashtag is required.",
            "array.base": "Hashtags must be an array."
        })
        .optional(),
}).unknown(false);

export const creaetPollSchema: ObjectSchema = createPostSchema.concat(
    Joi.object({
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
        })
    })
)

export const updatePostSchema: ObjectSchema = Joi.object({
    content: Joi.string().min(3)
        .messages({
            "string.min": "Post content must have at least {#limit} characters."
        })
        .optional(),
    visibility: Joi.string().valid("public", "private", "friends").default("public")
        .messages({
            "any.only": "Error: visibility must be 'public', 'private', or 'friends'."
        })
        .optional(),
    noUpdateKeys: Joi.array()
        .items(Joi.string().messages({
            "string.base": "Each key must be a string.",
            "string.empty": "Key cannot be empty."
        }))
        .min(1)
        .messages({
            "array.base": "noUpdateKeys must be an array.",
            "array.min": "At least one key must be specified if noUpdateKeys is provided."
        })
        .default([]),
    deleteKeys: Joi.array()
        .items(Joi.string().messages({
            "string.base": "Each key must be a string.",
            "string.empty": "Key cannot be empty."
        }))
        .min(1)
        .messages({
            "array.base": "deleteKeys must be an array.",
            "array.min": "At least one key must be specified if noUpdateKeys is provided."
        })
        .default([]),
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
    })).default([]),
    hashtags: Joi.array()
        .items(Joi.string().min(1).required().messages({
            "string.base": "Each hashtag must be a string.",
            "string.empty": "Hashtag cannot be empty.",
            "any.required": "Hashtag is required."
        }))
        .min(1)
        .messages({
            "array.min": "At least one hashtag is required.",
            "array.base": "Hashtags must be an array."
        })
        .default([])
}).unknown(false);
