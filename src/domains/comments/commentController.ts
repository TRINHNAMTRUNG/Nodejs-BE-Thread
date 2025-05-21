import { Request, Response, NextFunction } from "express";
import * as commentService from "./commentService";
import { plainToInstance } from "class-transformer";
import { CommentPayloadDTO, CommentResDTO, CommentWithPreviewDTO } from "./commentResponse.dto";
import { responseFomat } from "../../utils/responseFomat";
import { CommentPublisher } from "../../events/publishers/comment.publisher";
import { EventTypes } from "../../constants/eventTypes";
import { UserInfo } from "../../interfaces";


export const getEditHistoriesByCommentId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment_id } = req.params;

        const histories = await commentService.getHistoriesByCommentId(comment_id);

        return responseFomat(res, histories, "Get comment edit history successfully");
    } catch (error) {
        next(error);
    }
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userInfo = req.user as UserInfo;
        console.log("userInfo", userInfo);
        const result = await commentService.createComment(req.body, userInfo);

        // publish to kafka

        const commentMessageDto = plainToInstance(CommentPayloadDTO, result, { excludeExtraneousValues: true });
        const publisher = new CommentPublisher(EventTypes.COMMENT_CREATED, userInfo);
        publisher.publish(commentMessageDto);

        const response = plainToInstance(CommentResDTO, result, { excludeExtraneousValues: true });
        return responseFomat(res, response, "Comment created successfully");
    } catch (error) {
        next(error);
    }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userInfo = req.user as UserInfo;
        console.log("userInfo", userInfo);
        const result = await commentService.updateComment(id, req.body, userInfo);

        // publish to kafka

        const commentMessageDto = plainToInstance(CommentPayloadDTO, result, { excludeExtraneousValues: true });
        const publisher = new CommentPublisher(EventTypes.COMMENT_UPDATED, userInfo);
        publisher.publish(commentMessageDto);

        const response = plainToInstance(CommentResDTO, result, { excludeExtraneousValues: true });
        return responseFomat(res, response, "Comment updated successfully");
    } catch (error) {
        next(error);
    }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userInfo = req.user as UserInfo;
        const result = await commentService.deleteComment(id, userInfo);

        // publish to kafka

        const commentMessageDto = plainToInstance(CommentPayloadDTO, result, { excludeExtraneousValues: true });
        const publisher = new CommentPublisher(EventTypes.COMMENT_DELETED, userInfo);
        publisher.publish(commentMessageDto);

        return responseFomat(res, null, "Comment deleted successfully");
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