import { Schema, model } from "mongoose";


const VoteSchema = new Schema({
    target_id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "target_type" // ref động dựa trên trường 'target_type'
    },
    target_type: {
        type: String,
        required: true,
        enum: ["Post", "Comment"]
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, {
    timestamps: true,
    collection: "votes"
});

export const VoteModel = model("Vote", VoteSchema);
