import mongoose from "mongoose";
import { voteAPollOptionReq } from "../../interfaces";
import { AppError } from "../../utils/responseFomat";
import PostModel from "../posts/postModel";
import { PollVoteModel } from "./pollVoteModel";
import { VotePollOptionRequestDTO } from "../posts/postRequest.dto";
import { ErrorCode } from "../../constants/errorCodes";


export const voteAPollOption = async (postId: string, dataVote: VotePollOptionRequestDTO) => {
    const session = await mongoose.startSession();


    try {
        session.startTransaction();

        const { poll_option_id, user_id } = dataVote;

        const postExisting = await PostModel.findById(postId);
        if (!postExisting || postExisting.type !== "poll") {
            throw new AppError("Post not found", 404);
        }
        if (postExisting.poll!.end_at.getTime() < Date.now()) {
            throw new AppError("The poll has ended.", 404);
        }
        if (user_id === postExisting.creator_id.toString()) {
            throw new AppError("Creator can't vote in their own poll", 400);
        }
        const userVoted = await PollVoteModel.findOne({ user_id: user_id });
        if (userVoted) {
            throw new AppError("Users voted for options in the poll post", 400);
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
        const createPollVoteTask = PollVoteModel.create([{ ...dataVote, post_id: postId }], { session });

        const [updateTask] = await Promise.all([updateVoteCountTask, createPollVoteTask]);
        if (updateTask.modifiedCount === 0) {
            throw new Error("Error updating vote count in poll option");
        }
        await session.commitTransaction();
    } catch (error) {
        console.error("Error in voteAPollOption:", error);
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}