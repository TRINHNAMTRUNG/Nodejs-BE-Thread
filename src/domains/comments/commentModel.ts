import { Schema, model } from "mongoose";

const CommentSchema = new Schema({
    post_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Post"
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    content: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        enum: [1, 2],
        default: 1
    },
    parent_comment_id: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    reply_to_user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    like_count: { type: Number, default: 0 },
}, {
    timestamps: true,
    collection: "comments"
});

CommentSchema.index({ post_id: 1, level: 1, createdAt: -1 });

export const CommentModel = model("Comment", CommentSchema);
