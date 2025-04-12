import mongoose from "mongoose";
import { voteAPollOptionReq } from "../../interfaces";
import { AppError } from "../../utils/responseFomat";
import PostModel from "../posts/postModel";
import { PollVoteModel } from "./pollVoteModel";
import { VotePollOptionRequestDTO } from "../posts/postRequest.dto";
import { ErrorCode } from "../../constants/errorCodes";
import { StatusPoll } from "../../constants/postEnum";


export const voteAPollOption = async (postId: string, dataVote: VotePollOptionRequestDTO) => {
    const session = await mongoose.startSession();

    try {
        const { poll_option_id, user_id } = dataVote;
        // Check if post note found
        const postExisting = await PostModel.findById(postId);
        if (!postExisting || postExisting.type !== "poll") {
            throw new AppError("Post not found", 404);
        }
        // Check if post has ended (date now > end date)
        session.startTransaction();
        if (postExisting.poll!.end_at.getTime() < Date.now()) {
            if (postExisting.poll!.status_poll === StatusPoll.OPENNING) {
                postExisting.poll!.status_poll = StatusPoll.CLOSED;
                await postExisting.save();
            }
            throw new AppError("The poll has ended.", 400);
        }
        // Check if user is creator
        if (user_id === postExisting.creator_id.toString()) {
            throw new AppError("Creator can't vote in their own poll", 400);
        }
        // Check if user is creator
        const userVoted = await PollVoteModel.findOne({ user_id: user_id });
        if (userVoted) {
            throw new AppError("Users voted for options in the poll post", 400);
        }

        const updateVoteCountTask = PostModel.updateOne(
            {
                _id: new mongoose.Types.ObjectId(postId),
                "poll.poll_options._id": new mongoose.Types.ObjectId(poll_option_id),
            },
            {
                $inc: { "poll.poll_options.$.vote_count": 1 },
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