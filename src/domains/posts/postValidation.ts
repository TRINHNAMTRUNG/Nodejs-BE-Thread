import Joi, { ObjectSchema } from "joi";

// JOI POST VALIDATION SCHEMAS
export const createPostSchema: ObjectSchema = Joi.object({
    creator_id: Joi.string().length(24).hex().required()
        .messages({
            "*": "Invalid creator_id"
        }),
    content: Joi.string().min(1).required()
        .empty()
        .messages({
            "string.empty": "Post content cannot be empty.",
            "string.min": "Post content must have at least {#limit} characters.",
            "any.required": "Post content is required."
        }),
    visibility: Joi.string().valid("public", "private", "friends").default("public")
        .empty()
        .messages({
            "string.empty": "Post visibility cannot be empty.",
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

export const baseUpdatePostSchema: ObjectSchema = Joi.object({
    content: Joi.string().min(3)
        .empty()
        .messages({
            "string.empty": "Post content cannot be empty.",
            "string.min": "Post content must have at least {#limit} characters."
        }),
    visibility: Joi.string().valid("public", "private", "friends")
        .empty()
        .messages({
            "string.empty": "Post visibility cannot be empty.",
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
})

export const updatePostSchema: ObjectSchema = baseUpdatePostSchema.concat(
    Joi.object({
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
            })
    })
);

// JOI POLL VALIDATION SCHEMAS
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
                vote_count: Joi.number().integer().min(0),
                voters: Joi.array()
                    .items(Joi.string().length(24).hex())
            })).min(2).max(4).messages({
                "array.base": "poll_options must be an array.",
                "array.min": "At least {#limit} options are required in the poll.",
                "array.max": "Only allow maximum 4 options in the poll.",
            })
        }).required()
    })
);

//JOI QUOTE POST VALIDATION SCHEMAS
export const createQuotePostSchema: ObjectSchema = createPostSchema.concat(
    Joi.object({
        quoted_post_id: Joi.string().length(24).hex().required()
            .messages({
                "*": "Invalid quoted_post_id"
            }),
    })
)

export const generalCreatePostSchema = Joi.alternatives().conditional('type', {
    switch: [
        { is: 'normal', then: createPostSchema },
        { is: 'poll', then: createPollSchema },
        { is: 'quote', then: createQuotePostSchema },
    ],
    otherwise: Joi.any().custom((value, helpers) => {
        if (!value.type || !['normal', 'poll', 'quote'].includes(value.type)) {
            return helpers.error('any.invalid', { message: "Type must be 'normal', 'poll', or 'quote'." });
        }
        return value;
    }),
});
export const generalUpdatePostSchema = Joi.alternatives().conditional('type', {
    switch: [
        { is: 'normal', then: updatePostSchema },
        { is: 'poll', then: baseUpdatePostSchema },
        { is: 'quote', then: baseUpdatePostSchema },
    ],
    otherwise: Joi.any().custom((value, helpers) => {
        if (!value.type || !['normal', 'poll', 'quote'].includes(value.type)) {
            return helpers.error('any.invalid', { message: "Type must be 'normal', 'poll', or 'quote'." });
        }
        return value;
    }),
});

// JOI VOTE A POLL OPTION VALIDATION SCHEMAS
export const votePollOptionSchema: ObjectSchema = Joi.object({
    poll_option_id: Joi.string().length(24).hex().required()
        .messages({
            "*": "Invalid poll_option_id"
        }),
    post_id: Joi.string().length(24).hex().required()
        .messages({
            "*": "Invalid post_id"
        }),
    user_id: Joi.string().length(24).hex().required()
        .messages({
            "*": "Invalid user_id"
        }),
});

// JOI QUERY VALIDATION SCHEMAS
export const idQuerySchema: ObjectSchema = Joi.object({
    id: Joi.string().length(24).hex().required()
        .messages({
            "*": "Invalid id parameter"
        }),
})

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