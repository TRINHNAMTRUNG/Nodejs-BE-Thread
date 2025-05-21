import { model, Schema } from "mongoose";

const CommentEditHistorySchema = new Schema({
    comment_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Comment'
    },
    post_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Post'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    }
}, {
    collection: "comment_edit_histories",
    timestamps: true
});

const CommentEditHistoryModel = model("CommentEditHistory", CommentEditHistorySchema);
export default CommentEditHistoryModel;
