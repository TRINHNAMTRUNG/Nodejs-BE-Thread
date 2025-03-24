import Joi, { ObjectSchema } from "joi";

export const createPostSchema: ObjectSchema = Joi.object({
    creator_id: Joi.string().length(24).hex().required()
        .messages({
            "*": "Invalid creator_id"
        }),
    content: Joi.string().min(1).required()
        .messages({
            "string.min": "Post content must have at least {#limit} characters.",
            "any.required": "Post content is required."
        }),
    visibility: Joi.string().valid("public", "private", "friends").default("public")
        .messages({
            "any.only": "visibility must be 'public', 'private', or 'friends'."
        }),
    user_tags: Joi.array().items(
        Joi.object({
            id: Joi.string().length(24).hex().required()
                .messages({
                    "string.length": "user_tags id must be exactly {#limit} characters.",
                    "string.hex": "user_tags id must be a valid hexadecimal string.",
                    "any.required": "user_tags id is required."
                }),
            name: Joi.string().min(1).max(50).required()
                .messages({
                    "string.max": "name cannot exceed {#limit} characters.",
                    "any.required": "user_tags name is required."
                }),
        }).messages({
            "object.base": "Each user_tag must be a valid object."
        })
    ).min(1).messages({
        "array.base": "user_tags must be an array.",
        "array.min": "user_tags must contain at least one tag."
    }),
    hashtags: Joi.array()
        .items(Joi.string().min(1).messages({
            "string.base": "Each hashtag must be a string."
        }))
        .min(1)
        .messages({
            "array.base": "Hashtags must be an array.",
            "array.min": "Hashtags must contain at least one tag."
        })

});

export const createPollSchema: ObjectSchema = createPostSchema.concat(
    Joi.object({
        poll: Joi.object({
            end_at: Joi.date().required()
                .messages({
                    "any.required": "end_at is required."
                }),
            status_poll: Joi.string().valid("Closed", "Opening").default("Opening")
                .messages({
                    "any.only": "status_poll must be 'Closed' or 'Opening'."
                }),
            poll_options: Joi.array().items(Joi.object({
                content: Joi.string().required()
                    .messages({
                        "any.required": "poll_options content is required."
                    }),
                vote_count: Joi.number().min(0).default(0),
                voters: Joi.array()
                    .items(Joi.string().length(24).hex())
            })).min(2).messages({
                "array.base": "poll_options must be an array.",
                "array.min": "At least {#limit} options are required in the poll."
            })
        }).required()
    })
);

export const updatePostSchema: ObjectSchema = Joi.object({
    content: Joi.string().min(3)
        .empty()
        .messages({
            "string.empty": "Post content cannot be empty.",
            "string.min": "Post content must have at least {#limit} characters."
        })
        .optional(),
    visibility: Joi.string().valid("public", "private", "friends")
        .empty()
        .messages({
            "string.empty": "Post visibility cannot be empty.",
            "any.only": "visibility must be 'public', 'private', or 'friends'."
        })
        .optional(),
    noUpdateKeys: Joi.array()
        .items(Joi.string().min(1).messages({
            "string.base": "Each noUpdateKeys must be a string."
        }))
        .min(1)
        .messages({
            "array.base": "noUpdateKeys must be an array.",
            "array.min": "noUpdateKeys must contain at least one tag."
        }),
    deleteKeys: Joi.array()
        .items(Joi.string().min(1).messages({
            "string.base": "Each deleteKeys must be a string."
        }))
        .min(1)
        .messages({
            "array.base": "deleteKeys must be an array.",
            "array.min": "deleteKeys must contain at least one tag."
        }),
    user_tags: Joi.array().items(
        Joi.object({
            id: Joi.string().length(24).hex().required()
                .messages({
                    "string.length": "user_tags id must be exactly {#limit} characters.",
                    "string.hex": "user_tags id must be a valid hexadecimal string.",
                    "any.required": "user_tags id is required."
                }),
            name: Joi.string().min(1).max(50).required()
                .messages({
                    "string.max": "name cannot exceed {#limit} characters.",
                    "any.required": "user_tags name is required."
                }),
        }).messages({
            "object.base": "Each user_tag must be a valid object."
        })
    ).min(1).messages({
        "array.base": "user_tags must be an array.",
        "array.min": "user_tags must contain at least one tag."
    }),
    hashtags: Joi.array()
        .items(Joi.string().min(1).messages({
            "string.base": "Each hashtag must be a string."
        }))
        .min(1)
        .messages({
            "array.base": "Hashtags must be an array.",
            "array.min": "Hashtags must contain at least one tag."
        })
});

// Schema query params validation
export const paginationQuerySchema: ObjectSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1)
        .messages({
            "number.base": "Page must be a number",
            "number.integer": "Page must be an integer",
            "number.min": "Page cannot be less than 1"
        }),
    limit: Joi.number().integer().min(1).max(100).default(10)
        .messages({
            "number.base": "Limit must be a number",
            "number.integer": "Limit must be an integer",
            "number.min": "Limit cannot be less than 1",
            "number.max": "Limit cannot exceed 100"
        })
}).unknown(true);