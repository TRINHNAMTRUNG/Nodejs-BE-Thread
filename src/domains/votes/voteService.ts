import mongoose from "mongoose";
import { VoteModel } from "./voteModel";
import PostModel from "../posts/postModel";
import { AppError } from "../../utils/AppError";
import httpStatusCode from "http-status";
import { Target_type, VoteType } from "../../constants/voteEnum";
import { CommentModel } from "../comments/commentModel";

// Hàm xử lý vote
export const votePost = async (id: string, userId: string, session: mongoose.ClientSession, model: mongoose.Model<any>, target_type: Target_type) => {
    const updateResult = await model.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $inc: { like_count: 1 } },
        { session }
    );
    if (updateResult.modifiedCount === 0) {
        throw new Error("Error updating like count");
    }
    const createResult = await VoteModel.create(
        [{
            target_id: id,
            user_id: userId,
            target_type
        }],
        { session }
    );
    return createResult[0];
};

// Hàm xử lý unvote
export const unvotePost = async (id: string, existingVoteId: string, session: mongoose.ClientSession, model: mongoose.Model<any>) => {
    const updateResult = await model.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $inc: { like_count: -1 } },
        { session }
    );
    if (updateResult.modifiedCount === 0) {
        throw new Error("Error updating like count");
    }
    const deleteResult = await VoteModel.findOneAndDelete(
        { _id: existingVoteId },
        { session }
    );
    return deleteResult;
};

// Hàm chính để xử lý vote hoặc unvote
export const voteActionService = async (id: string, userId: string, target_type: Target_type) => {
    const session = await mongoose.startSession();
    let vote_type: VoteType;
    let result;
    try {
        session.startTransaction(); // <-- Đặt ngay sau khi tạo session

        // Xác định model dựa trên target_type
        const model: mongoose.Model<any> = target_type === Target_type.POST ? PostModel : CommentModel;

        // Kiểm tra xem tài liệu có tồn tại không
        const target = await model.findById(id).session(session);
        if (!target) {
            throw AppError.logic(
                `${target_type === Target_type.POST ? "Post" : "Comment"} not found`,
                404,
                httpStatusCode["404_NAME"]
            );
        }

        // Kiểm tra xem user đã vote chưa
        const existingVote = await VoteModel.findOne({
            target_id: id,
            user_id: userId,
            target_type
        }).session(session);

        if (existingVote) {
            // Nếu đã vote, thực hiện unvote
            result = await unvotePost(id, existingVote._id.toString(), session, model);
            vote_type = VoteType.UNVOTED;
        } else {
            // Nếu chưa vote, thực hiện vote
            result = await votePost(id, userId, session, model, target_type);
            vote_type = VoteType.VOTED;
        }

        await session.commitTransaction();
    } catch (error) {
        console.error(
            `Error in voteActionService for ${target_type === Target_type.POST ? "Post" : "Comment"} with ID ${id}:`,
            error
        );
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
    console.log("result =>>>>>> ", result);
    return { ...result?.toObject(), vote_type };
};

export const getUserLikedPost = async (post_id: string) => {
    const posts = await VoteModel.find(
        { target_id: post_id, target_type: Target_type.POST },
        { user_id: 1 }
    ).lean();
    return posts;
};