import { Request, Response } from "express";
import * as postService from "./postService";
import { responseFomat } from "../../utils/responseFomat";
import { createPostReq, updatePostReq } from "../../interfaces/index";
import { PostDTO } from "./postDTO";
import { plainToInstance } from "class-transformer";

export const createPostCtrl = async (req: Request<{}, {}, createPostReq>, res: Response) => {
    try {
        const post = req.body;
        const newPost = await postService.createPost(post);

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

export const updatePostCtrl = async (req: Request<{ id: string }, {}, updatePostReq>, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedPost = await postService.updatePost(id, updateData);

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
        const deletedPost = await postService.deletePost(id);

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

export const getPostByIdCtrl = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const post = await postService.getPostById(id);

        if (!post) {
            return responseFomat(res, null, "Post not found", false, 404);
        }

        // Chuyển đổi model thành DTO
        const postDto = plainToInstance(PostDTO, post, { excludeExtraneousValues: true });

        return responseFomat(res, postDto, "Post retrieved successfully");
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