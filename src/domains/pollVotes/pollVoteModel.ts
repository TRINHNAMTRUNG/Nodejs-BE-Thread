
import { Schema, model } from "mongoose";

const PollVoteSchema = new Schema(
    {
        poll_option_id: { type: Schema.Types.ObjectId, required: true },
        user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        post_id: { type: Schema.Types.ObjectId, required: true, ref: "Post" }
    },
    { timestamps: true, collection: "poll_votes" }
);

PollVoteSchema.index({ poll_option_id: 1, user_id: 1 }, { unique: true });

const PollVoteModel = model("PollVote", PollVoteSchema);
export default PollVoteModel;

