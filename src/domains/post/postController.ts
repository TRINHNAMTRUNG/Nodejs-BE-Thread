import { Request, Response } from "express";
import * as postService from "./postService";
import { responseFomat } from "../../utils/responseFomat";
import { createPollReq, createPostReq, updatePostReq } from "../../interfaces/index";
import { CreatPollDTO, PostDTO } from "./postDTO";
import { plainToInstance } from "class-transformer";

export const createPostCtrl = async (req: Request<{}, {}, createPostReq>, res: Response) => {
    try {
        const post = req.body;
        const files = Array.isArray(req?.files) ? req.files : undefined;
        console.log(">>> check files field: ", files)
        // console.log(">>> check req: ", req.files)
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
        const pollDto = plainToInstance(CreatPollDTO, newPoll, { excludeExtraneousValues: true });

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


export const updatePostCtrl = async (req: Request<{ id: string }, {}, updatePostReq>, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const { deleteKeys, noUpdateKeys } = updateData;
        if (deleteKeys.length === 0 && noUpdateKeys.length === 0 && !req?.files) {
            return responseFomat(res, null, "Nothing has changed.");
        }
        const files = Array.isArray(req?.files) ? req.files : undefined;
        const updatedPost = await postService.updatePost(id, updateData, files);

        if (!updatedPost) {
            return responseFomat(res, null, "Post not found", false, 404);
        }
        // Chuyển đổi model thành DTO
        const postDto = plainToInstance(PostDTO, updatedPost, { excludeExtraneousValues: true });
        return responseFomat(res, postDto, "Post updated successfully");
    } catch (error: any) {
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
        if (fileKeys.length === 0) {
            return responseFomat(res, null, "Post not found", false, 404);
        }
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
        const { limit, page } = req.query;
        const posts = await postService.getPostByUserId(id, Number(limit), Number(page));

        if (!posts) {
            return responseFomat(res, null, "User id not found", false, 404);
        }

        // Chuyển đổi model thành DTO
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

        // Chuyển đổi danh sách posts thành DTOs
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