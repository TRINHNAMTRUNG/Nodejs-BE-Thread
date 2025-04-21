import mongoose from "mongoose";
import { VoteModel } from "./voteModel";
import PostModel from "../posts/postModel";
import { AppError } from "../../utils/AppError";
import httpStatusCode from "http-status"
export const voteAPostService = async (postId: string, userId: string) => {
    const session = await mongoose.startSession();

    try {
        // Tìm post
        const post = await PostModel.findById(postId);
        if (!post) {
            throw AppError.logic("Post not found", 404, httpStatusCode["404_NAME"]);
        }

        // Kiểm tra xem user đã vote chưa
        const existingVote = await VoteModel.findOne({
            post_id: postId,
            user_id: userId
        });
        session.startTransaction();
        if (existingVote) {
            // Nếu đã vote rồi thì thực hiện unvote
            const updateLikeCountTask = PostModel.updateOne(
                { _id: new mongoose.Types.ObjectId(postId) },
                { $inc: { like_count: -1 } },
                { session }
            );
            const deleteVoteTask = VoteModel.deleteOne({
                _id: existingVote._id
            }, { session });

            const [updateResult] = await Promise.all([updateLikeCountTask, deleteVoteTask]);
            if (updateResult.modifiedCount === 0) {
                throw new Error("Error updating like count");
            }
            await session.commitTransaction();
        } else {
            // Nếu chưa vote thì thực hiện vote
            const updateLikeCountTask = PostModel.updateOne(
                { _id: new mongoose.Types.ObjectId(postId) },
                { $inc: { like_count: 1 } },
                { session }
            );
            const createVoteTask = VoteModel.create([{
                post_id: postId,
                user_id: userId,
            }], { session });

            const [updateResult] = await Promise.all([updateLikeCountTask, createVoteTask]);
            if (updateResult.modifiedCount === 0) {
                throw new Error("Error updating like count");
            }
            await session.commitTransaction();
        }
    } catch (error) {
        console.error("Error in voteAPostService:", error);
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};