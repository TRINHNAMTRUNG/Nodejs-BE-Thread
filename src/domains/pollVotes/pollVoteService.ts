import mongoose from "mongoose";
import { voteAPollOptionReq } from "../../interfaces";
import { AppError } from "../../utils/responseFomat";
import PostModel from "../posts/postModel";
import { PollVoteModel } from "./pollVoteModel";


export const voteAPollOption = async (postId: string, dataVote: voteAPollOptionReq) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { poll_option_id, user_id } = dataVote;
        const postExisting = await PostModel.findById(postId);
        if (!postExisting || postExisting.type !== "poll") {
            throw new AppError("Post not found", 404);
        }
        if (user_id === postExisting.creator_id.toString()) {
            throw new AppError("Creator can't vote in their own poll", 400);
        }
        if (postExisting!.poll!.status_poll === "Closed" || postExisting!.poll!.end_at < new Date()) {
            throw new AppError("Poll has ended", 400);
        }
        const updateVoteCountTask = PostModel.updateOne(
            {
                _id: new mongoose.Types.ObjectId(postId),
                "poll.poll_options._id": new mongoose.Types.ObjectId(poll_option_id),
            },
            {
                $inc: { "poll.poll_options.$.vote_count": 1 }
            },
            { session }
        )
        const createPollVoteTask = PollVoteModel.create([dataVote], { session });
        const [updateTask] = await Promise.all([updateVoteCountTask, createPollVoteTask]);
        if (updateTask.modifiedCount === 0) {
            throw new Error("Error updating vote count in poll option");
        }
        await session.commitTransaction();
    } catch (error) {
        console.error("Error in voteAPollOption:", error);
        throw error;
    } finally {
        session.endSession();
    }
}