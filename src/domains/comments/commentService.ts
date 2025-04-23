import { CommentModel } from "./commentModel";
import { plainToInstance } from "class-transformer";
import { CommentResDTO, CommentWithPreviewDTO } from "./commentResponse.dto";
import { CreateCommentRequestDTO } from "./commentRequest.dto";
import { Types } from "mongoose";
import PostModel from "../posts/postModel";
import { AppError } from "../../utils/AppError";
import httpStatusCode from "http-status";
export const createComment = async (dto: CreateCommentRequestDTO) => {
    let level = 1;

    // Nếu có parent_comment_id, kiểm tra xem comment cha có tồn tại trong bài viết không
    if (dto.parent_comment_id) {
        const parent = await CommentModel.findOne({ _id: dto.parent_comment_id, post_id: dto.post_id });

        if (!parent) {
            throw new Error("Parent comment does not exist in the specified post.");
        }

        // Nếu comment cha tồn tại, đặt level = 2
        level = 2;
    }
    // Kiểm tra nếu reply_to_user_id trùng với user_id, gán giá trị null
    if (dto.reply_to_user_id === dto.user_id) {
        dto.reply_to_user_id = undefined;
    }

    const newComment = await CommentModel.create({
        ...dto,
        level
    });

    return newComment;
};

export const getCommentsWithPreview = async (post_id: string, page = 1, limit = 10) => {
    // Kiểm tra xem bài viết có tồn tại không
    const postExists = await PostModel.exists({ _id: new Types.ObjectId(post_id) });
    if (!postExists) {
        throw AppError.logic("Post does not exist.", 404, httpStatusCode["404_NAME"]);
    }

    // Tính toán skip để phân trang
    const skip = (page - 1) * limit;

    // Lấy các comment cấp 1 với phân trang
    const level1 = await CommentModel.find({ post_id: new Types.ObjectId(post_id), level: 1 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    if (level1.length === 0) {
        return level1;
    }

    // Lấy preview của các comment cấp 2
    const result = await Promise.all(level1.map(async (comment) => {
        const preview = await CommentModel.findOne({
            parent_comment_id: comment._id,
            level: 2
        })
            .sort({ createdAt: 1 })
            .lean();
        return {
            ...comment,
            previewReply: preview || null
        };
    }));

    return result;
};

export const getMoreReplies = async (post_id: string, parent_comment_id: string, page = 1, limit = 5) => {
    const skip = (page - 1) * limit;

    // Kiểm tra xem bài viết có tồn tại không
    const postExists = await PostModel.exists({ _id: new Types.ObjectId(post_id) });
    if (!postExists) {
        throw AppError.logic("Post does not exist.", 404, httpStatusCode["404_NAME"]);
    }

    // Kiểm tra xem comment cha có tồn tại trong bài viết không
    const parentCommentExists = await CommentModel.exists({
        _id: new Types.ObjectId(parent_comment_id),
        post_id: new Types.ObjectId(post_id)
    });
    if (!parentCommentExists) {
        throw AppError.logic("Parent comment does not exist in the specified post.", 404, httpStatusCode["404_NAME"]);
    }

    // Lấy danh sách các comment cấp 2 (replies) với phân trang
    const replies = await CommentModel.find({
        parent_comment_id: new Types.ObjectId(parent_comment_id),
        level: 2
    })
        .sort({ createdAt: 1 }) // Sắp xếp theo thời gian tạo (cũ nhất trước)
        .skip(skip)
        .limit(limit)
        .lean();

    return replies;
};