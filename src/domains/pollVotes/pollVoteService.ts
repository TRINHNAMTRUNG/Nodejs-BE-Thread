import mongoose from "mongoose";
import { AppError } from "../../utils/AppError";
import PostModel from "../posts/postModel";
import PollVoteModel from "./pollVoteModel";
import { VotePollOptionRequestDTO } from "../posts/postRequest.dto";
import { StatusPoll } from "../../constants/postEnum";
import httpStatusCode from "http-status";
import { UserInfo } from "../../interfaces";

export const voteAPollOption = async (postId: string, dataVote: VotePollOptionRequestDTO, userInfo: UserInfo) => {
    const session = await mongoose.startSession();
    try {
        const { poll_option_id } = dataVote;
        // Check if post exists and is poll type
        const postExisting = await PostModel.findById(postId);
        if (!postExisting || postExisting.type !== "poll") {
            throw AppError.logic("Post not found", 404, httpStatusCode["404_NAME"]);
        }

        await session.startTransaction();

        // Check if poll has ended
        if (postExisting.poll!.end_at.getTime() < Date.now()) {
            if (postExisting.poll!.status_poll === StatusPoll.OPENNING) {
                postExisting.poll!.status_poll = StatusPoll.CLOSED;
                await postExisting.save();
            }
            throw AppError.logic("The poll has ended.", 400, httpStatusCode["400_NAME"]);
        }

        // Check if user is creator
        if (userInfo._id === postExisting.creator_id.toString()) {
            throw AppError.logic("Creator can't vote in their own poll", 400, httpStatusCode["400_NAME"]);
        }

        // Check if user already voted
        const userVoted = await PollVoteModel.findOne({ user_id: userInfo._id, post_id: postId, poll_option_id }, null, { session });
        if (userVoted) {
            throw AppError.logic("Users voted for options in the poll post", 400, httpStatusCode["400_NAME"]);
        }

        // Update vote count for poll option
        const updateResult = await PostModel.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(postId),
                "poll.poll_options._id": new mongoose.Types.ObjectId(poll_option_id)
            },
            { $inc: { "poll.poll_options.$.vote_count": 1 } },
            { new: true, session }
        );
        console.log("updateResult ========", updateResult);
        if (!updateResult) {
            throw AppError.logic("Poll option not found", 404, httpStatusCode["404_NAME"]);
        }

        // Create poll vote
        const createResult = await PollVoteModel.create([{ ...dataVote, post_id: postId, user_id: userInfo._id }], { session });

        await session.commitTransaction();
        return { _id: postId, poll: updateResult.poll, dataPollVote: createResult[0].toObject() };
    } catch (error) {
        console.error("Error in voteAPollOption:", error);
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const getUsersVotedPollOption = async (
    post_id: string,
    poll_option_id: string,
    page: number,
    limit: number
) => {
    const skip = (page - 1) * limit;

    // Chỉ lấy user_id, không populate
    const votes = await PollVoteModel.find({ post_id, poll_option_id })
        .skip(skip)
        .limit(limit)
        .select("user_id -_id")
        .lean();

    // Trả về mảng user_id (ObjectId)
    return votes.map(v => v.user_id);
};