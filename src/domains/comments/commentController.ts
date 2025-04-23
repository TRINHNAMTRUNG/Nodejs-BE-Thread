import { Request, Response, NextFunction } from "express";
import * as commentService from "./commentService";
import { plainToInstance } from "class-transformer";
import { CommentResDTO, CommentWithPreviewDTO } from "./commentResponse.dto";
import { responseFomat } from "../../utils/responseFomat";

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newComment = await commentService.createComment(req.body);
        const response = plainToInstance(CommentResDTO, newComment, { excludeExtraneousValues: true });
        return responseFomat(res, response, "Comment created successfully");
    } catch (error) {
        next(error);
    }
};

export const getPreviewComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const post_id = req.params.post_id;
        const { page = 1, limit = 10 } = req.query;

        const comments = await commentService.getCommentsWithPreview(
            post_id,
            Number(page),
            Number(limit)
        );

        const response = plainToInstance(CommentWithPreviewDTO, comments, { excludeExtraneousValues: true });
        return responseFomat(res, response, "Fetched comments successfully");
    } catch (error) {
        next(error);
    }
};

export const getMoreCommentReplies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { post_id, parent_comment_id } = req.params;
        const { page = 1, limit = 5 } = req.query;

        const replies = await commentService.getMoreReplies(
            post_id,
            parent_comment_id,
            Number(page),
            Number(limit)
        );

        const response = plainToInstance(CommentResDTO, replies, { excludeExtraneousValues: true });
        return responseFomat(res, response, "Fetched more replies");
    } catch (error) {
        next(error);
    }
};