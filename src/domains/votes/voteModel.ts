
import { Schema, model } from "mongoose";

const VoteSchema = new Schema({
    post_Id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Post"
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, { timestamps: true, collection: "votes" });

export const VoteModel = model("Vote", VoteSchema);

