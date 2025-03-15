
import { string } from "joi";
import mongoose, { Schema, model } from "mongoose";

const PostSchema = new Schema(
    {
        creator_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        reply_to: { type: Schema.Types.ObjectId, ref: "User" },
        content: { type: String, required: true },
        visibility: { type: String, enum: ["public", "private", "friends"], default: "public" },
        reply_count: { type: Number, default: 0 },
        like_count: { type: Number, default: 0 },
        comment_count: { type: Number, default: 0 },
        save_post_count: { type: Number, default: 0 },
        images: { type: [String], minLength: 1 },
        user_tags: {
            type: [
                {
                    id: { type: Schema.Types.ObjectId, required: true },
                    name: { type: String, required: true },
                }
            ], minLength: 1
        }, // Danh sách id user
        hashtags: { type: [String], minLength: 1 },
        poll: {
            type: {
                end_at: { type: Date, required: true },
                status_poll: { type: String, enum: ["Closed", "Openning"], default: "Openning" },
                poll_options: {
                    type: [
                        {
                            content: { type: String, required: true }, // Nội dung của option
                            vote_count: { type: Number, default: 0 }, // Số lượng vote
                            voters: { type: [Schema.Types.ObjectId], default: [] } // Danh sách ID user đã vote
                        }
                    ],
                    minLength: 2,
                    required: true
                }
            },
            _id: false
        }
    },
    { timestamps: true, collection: "posts" }
);

PostSchema.index({ hashtags: 1, createdAt: -1 }); // Tìm post hashtag tương tự - mới nhất
PostSchema.index({ content: "text", createdAt: -1 }); // Tìm post nội dung liên quan - mới nhất 


const PostModel = model("Post", PostSchema);

export default PostModel;
