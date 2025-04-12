
import mongoose, { Schema, model } from "mongoose";

const PostSchema = new Schema(
    {
        type: { type: String, enum: ["normal", "poll", "quote"], required: true },
        creator_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        content: { type: String, required: true },
        visibility: { type: String, enum: ["public", "private", "friends"], default: "public" },
        like_count: { type: Number, default: 0 },
        comment_count: { type: Number, default: 0 },
        quote_post_count: { type: Number, default: 0 },
        urls: {
            type: [
                {
                    key: { type: String, required: true },
                    url: { type: String, required: true },
                    _id: false
                }
            ], minLength: 1, default: []
        },
        user_tags: {
            type: [
                {
                    id: { type: Schema.Types.ObjectId, required: true },
                    name: { type: String, required: true },
                }
            ], minLength: 1, default: []
        }, // Danh sách id user
        hashtags: { type: [String], minLength: 1, default: [] },
        poll: {
            type: {
                end_at: { type: Date, default: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) },
                status_poll: { type: String, enum: ["Closed", "Openning"], default: "Openning" },
                poll_options: {
                    type: [
                        {
                            content: { type: String, required: true }, // Nội dung của option
                            vote_count: { type: Number, default: 0 }, // Số lượng vote
                            voters: { type: [Schema.Types.ObjectId], default: [] }, // Danh sách ID user đã vote
                        }
                    ],
                    minLength: 2,
                    required: true
                }
            },
            _id: false
        },
        quoted_post_id: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    },
    { timestamps: true, collection: "posts" }
);

PostSchema.index({ hashtags: 1, createdAt: -1 }); // Tìm post hashtag tương tự - mới nhất
PostSchema.index({ content: "text", createdAt: -1 }); // Tìm post nội dung liên quan - mới nhất 

const PostModel = model("Post", PostSchema);

export default PostModel;
