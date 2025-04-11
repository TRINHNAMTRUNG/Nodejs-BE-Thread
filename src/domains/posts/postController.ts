import { Request, Response } from "express";
import * as postService from "./postService";
import { responseFomat, handleError } from "../../utils/responseFomat";
import { createPollReq, createPostReq, createQuotePostReq, updatePollReq, updatePostReq, updateQuotePostReq, voteAPollOptionReq } from "../../interfaces/index";
import { PollDTO, PostDTO, QuotePostDTO } from "./postDTO";
import { plainToInstance } from "class-transformer";
import { ErrorCode } from "../../constants/errorCodes";
import { CreatePostRequestDTO } from "./postRequest.dto";
//POST CONTROLLERS

// export const generalCreatePostCtrl = async (req: Request, res: Response) => {
//     const { type, ...mainData } = req.body;
//     req.body = mainData;
//     switch (type) {
//         case "normal":
//             return createPostCtrl(req, res);
//         case "poll":
//             return createPollCtrl(req, res);
//         case "quote":
//             return createQuotePostCtrl(req, res);
//     }
// }
// export const generalUpdatePostCtrl = async (req: Request<{ id: string }>, res: Response) => {
//     const { type, ...mainData } = req.body;
//     req.body = mainData;
//     switch (type) {
//         case "normal":
//             return updatePostCtrl(req, res);
//         case "poll":
//             return updatePollCtrl(req, res);
//         case "quote":
//             return updateQuotePostCtrl(req, res);
//     }
// }

export const createPostCtrl = async (req: Request<{}, {}, CreatePostRequestDTO>, res: Response) => {
    try {
        const post = req.body;

        const files = Array.isArray(req?.files) ? req.files : undefined;
        const newPost = await postService.createPost(post, files);

        const postDto = plainToInstance(PostDTO, newPost, { excludeExtraneousValues: true });
        return responseFomat(res, postDto, "Post created successfully");
    } catch (error: any) {
        handleError(error, res, "Error creating post", ErrorCode.INTERNAL_SERVER_ERROR);
    }
};

export const updatePostCtrl = async (req: Request, res: Response) => {
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
        handleError(error, res, "Error updating post", ErrorCode.INTERNAL_SERVER_ERROR);
    }
};

export const deletePostCtrl = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const fileKeys = await postService.getFileKeys(id);
        const deletedPost = await postService.deletePost(id, fileKeys);

        if (!deletedPost) {
            return responseFomat(res, null, "Post not found", false, 404);
        }

        return responseFomat(res, null, "Post deleted successfully");
    } catch (error: any) {
        handleError(error, res, "Error deleting post", ErrorCode.INTERNAL_SERVER_ERROR);
    }
};

//POLL CONTROLLERS
export const createPollCtrl = async (req: Request, res: Response) => {
    try {
        const poll = req.body;
        const newPoll = await postService.createPoll(poll);

        const pollDto = plainToInstance(PollDTO, newPoll, { excludeExtraneousValues: true });
        return responseFomat(res, pollDto, "Poll created successfully");
    } catch (error: any) {
        handleError(error, res, "Error creating poll", ErrorCode.INTERNAL_SERVER_ERROR);
    }
};

export const updatePollCtrl = async (req: Request, res: Response) => {
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
        handleError(error, res, "Error updating poll", ErrorCode.INTERNAL_SERVER_ERROR);
    }
};

//QUOTE POST CONTROLLERS
export const createQuotePostCtrl = async (req: Request, res: Response) => {
    try {
        const quotePost = req.body;
        const newQuotePost = await postService.createQuotePost(quotePost);

        const quotePostDto = plainToInstance(QuotePostDTO, newQuotePost, { excludeExtraneousValues: true });
        return responseFomat(res, quotePostDto, "Quote post created successfully");
    } catch (error) {
        handleError(error, res, "Error creating quote post", ErrorCode.INTERNAL_SERVER_ERROR);
    }
}

export const updateQuotePostCtrl = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const defaultFields = {
            hashtags: [],
            user_tags: []
        };
        let updateData = { ...defaultFields, ...req.body };

        const updatedQuotePost = await postService.updateQuotePost(id, updateData);

        const quotePostDto = plainToInstance(QuotePostDTO, updatedQuotePost, { excludeExtraneousValues: true });
        return responseFomat(res, quotePostDto, "Quote post updated successfully");
    } catch (error: any) {
        handleError(error, res, "Error updating quote post", ErrorCode.INTERNAL_SERVER_ERROR);
    }
};



//GET CONTROLLERS
export const getPostByIdUserCtrl = async (req: Request, res: Response) => {
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
        handleError(error, res, "Error retrieving post", ErrorCode.INTERNAL_SERVER_ERROR);
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
