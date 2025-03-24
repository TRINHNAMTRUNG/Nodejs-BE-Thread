import { Request, Response } from "express";
import * as postService from "./postService";
import { AppError, responseFomat } from "../../utils/responseFomat";
import { createPollReq, createPostReq, updatePollReq, updatePostReq } from "../../interfaces/index";
import { PollDTO, PostDTO } from "./postDTO";
import { plainToInstance } from "class-transformer";

export const createPostCtrl = async (req: Request<{}, {}, createPostReq>, res: Response) => {
    try {
        const post = req.body;
        const files = Array.isArray(req?.files) ? req.files : undefined;
        const newPost = await postService.createPost(post, files);

        const postDto = plainToInstance(PostDTO, newPost, { excludeExtraneousValues: true });
        return responseFomat(res, postDto, "Post created successfully");
    } catch (error: any) {
        return responseFomat(
            res,
            null,
            "Error creating post",
            false,
            500,
            error.message || "Unknown error"
        );
    }
};

export const createPollCtrl = async (req: Request<{}, {}, createPollReq>, res: Response) => {
    try {
        const poll = req.body;
        const newPoll = await postService.createPoll(poll);

        const pollDto = plainToInstance(PollDTO, newPoll, { excludeExtraneousValues: true });
        return responseFomat(res, pollDto, "Poll created successfully");
    } catch (error: any) {
        return responseFomat(
            res,
            null,
            "Error creating poll",
            false,
            500,
            error.message || "Unknown error"
        );
    }
};

export const updatePollCtrl = async (req: Request<{ id: string }, {}, updatePollReq>, res: Response) => {
    try {
        const { id } = req.params;
        const defaultFields = {
            hashtags: [],
            user_tags: []
        };
        let updateData = { ...defaultFields, ...req.body };

        const updatedPoll = await postService.updatePoll(id, updateData);

        const pollDto = plainToInstance(PollDTO, updatedPoll, { excludeExtraneousValues: true });
        return responseFomat(res, pollDto, "Poll updated successfully");
    } catch (error: any) {
        if (error instanceof AppError) {
            return responseFomat(
                res,
                null,
                "Error updating post",
                false,
                error.statusCode,
                error.message || "Unknown error"
            );
        }
        return responseFomat(
            res,
            null,
            "Error updating post",
            false,
            500,
            error.message || "Unknown error"
        );
    }
}

export const updatePostCtrl = async (req: Request<{ id: string }, {}, updatePostReq>, res: Response) => {
    try {
        const { id } = req.params;
        const defaultFields = {
            deleteKeys: [],
            noUpdateKeys: [],
            hashtags: [],
            user_tags: []
        };
        let updateData = { ...defaultFields, ...req.body };
        const files = Array.isArray(req?.files) ? req.files : undefined;

        const updatedPost = await postService.updatePost(id, updateData, files);
        // console.log("updatedPost obj:", JSON.stringify(updatedPost, null, 2));

        const postDto = plainToInstance(PostDTO, updatedPost, { excludeExtraneousValues: true });
        // console.log("postDto: >>>", postDto);
        return responseFomat(res, postDto, "Post updated successfully");
    } catch (error: any) {
        if (error instanceof AppError) {
            return responseFomat(
                res,
                null,
                "Error updating post",
                false,
                error.statusCode,
                error.message || "Unknown error"
            );
        }
        return responseFomat(
            res,
            null,
            "Error updating post",
            false,
            500,
            error.message || "Unknown error"
        );
    }
};

export const deletePostCtrl = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const fileKeys = await postService.getFileKeys(id);
        const deletedPost = await postService.deletePost(id, fileKeys);

        if (!deletedPost) {
            return responseFomat(res, null, "Post not found", false, 404);
        }

        return responseFomat(res, null, "Post deleted successfully");
    } catch (error: any) {
        return responseFomat(
            res,
            null,
            "Error deleting post",
            false,
            500,
            error.message || "Unknown error"
        );
    }
};

export const getPostByIdUserCtrl = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;

        const posts = await postService.getPostByUserId(id, limit, page);

        if (!posts) {
            return responseFomat(res, null, "User id not found", false, 404);
        }

        const postsDto = plainToInstance(PostDTO, posts, { excludeExtraneousValues: true });
        return responseFomat(res, postsDto, "Post retrieved successfully");
    } catch (error: any) {
        return responseFomat(
            res,
            null,
            "Error retrieving post",
            false,
            500,
            error.message || "Unknown error"
        );
    }
};

export const getAllPostsCtrl = async (req: Request, res: Response) => {
    try {
        const posts = await postService.getAllPosts();
        const postDtos = plainToInstance(PostDTO, posts, { excludeExtraneousValues: true });
        return responseFomat(res, postDtos, "Posts retrieved successfully");
    } catch (error: any) {
        return responseFomat(
            res,
            null,
            "Error retrieving posts",
            false,
            500,
            error.message || "Unknown error"
        );
    }
};
