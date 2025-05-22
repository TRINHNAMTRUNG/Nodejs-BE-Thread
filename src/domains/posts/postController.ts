import { Request, Response, NextFunction } from "express";
import * as postService from "./postService";
import { responseFomat } from "../../utils/responseFomat";
import { DeletePostPayloadDTO, PollDTO, PostDTO, PostPayloadDTO, QuotePostDTO } from "./postResponse.dto";
import { plainToInstance } from "class-transformer";
import { CreatePollRequestDTO, CreatePostRequestDTO, CreateQuotePostRequestDTO, UpdatePostRequestDTO, UpdateQuoteAndPollPostRequestDTO } from "./postRequest.dto";
import { PostPublisher } from "../../events/publishers/post.publisher";
import { EventTypes } from "../../constants/eventTypes";
import { UserInfo } from "../../interfaces";
//POST CONTROLLERS

export const getAllPostsCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 8 } = req.query;

        const posts = await postService.getRandomPosts(Number(page), Number(limit));
        // Transform posts based on their type
        const postDtos = posts.map(post => {
            if (post.type === 'poll') {
                return plainToInstance(PollDTO, post, { excludeExtraneousValues: true });
            } else if (post.type === 'quote') {
                return plainToInstance(QuotePostDTO, post, { excludeExtraneousValues: true });
            } else {
                return plainToInstance(PostDTO, post, { excludeExtraneousValues: true });
            }
        });

        return responseFomat(res, postDtos, "Random posts retrieved successfully");
    } catch (error: any) {
        next(error);
    }
};

export const getPostByIdCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const post = await postService.getPostById(id);
        if (!post) {
            return responseFomat(res, null, "Post not found", false, 404);
        }
        let postDto;
        if (post.type === 'poll') {
            postDto = plainToInstance(PollDTO, post, { excludeExtraneousValues: true });
        } else if (post.type === 'quote') {
            postDto = plainToInstance(QuotePostDTO, post, { excludeExtraneousValues: true });
        } else {
            postDto = plainToInstance(PostDTO, post, { excludeExtraneousValues: true });
        }
        return responseFomat(res, postDto, "Post retrieved successfully");
    } catch (error: any) {
        next(error);
    }
};


export const getPostsByHashtagCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { hashtag } = req.params;
        const { page = 1, limit = 8 } = req.query;

        const posts = await postService.getPostsByHashtag(hashtag, Number(page), Number(limit));
        // Transform posts based on their type
        const postDtos = posts.map(post => {
            if (post.type === 'poll') {
                return plainToInstance(PollDTO, post, { excludeExtraneousValues: true });
            } else if (post.type === 'quote') {
                return plainToInstance(QuotePostDTO, post, { excludeExtraneousValues: true });
            } else {
                return plainToInstance(PostDTO, post, { excludeExtraneousValues: true });
            }
        });

        return responseFomat(res, postDtos, "Posts retrieved successfully");
    } catch (error: any) {
        next(error);
    }
};

export const searchPostsCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query, page = 1, limit = 8 } = req.query;

        const posts = await postService.searchPosts(query as string, Number(page), Number(limit));
        // Transform posts based on their type
        const postDtos = posts.map(post => {
            if (post.type === 'poll') {
                return plainToInstance(PollDTO, post, { excludeExtraneousValues: true });
            } else if (post.type === 'quote') {
                return plainToInstance(QuotePostDTO, post, { excludeExtraneousValues: true });
            } else {
                return plainToInstance(PostDTO, post, { excludeExtraneousValues: true });
            }
        });

        return responseFomat(res, postDtos, "Posts retrieved successfully");
    } catch (error: any) {
        next(error);
    }
};

export const createPostCtrl = async (req: Request<{}, {}, CreatePostRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const dataPost = req.body;
        const userInfo = req.user as UserInfo;
        const files = Array.isArray(req?.files) ? req.files : undefined;
        const result = await postService.createPost(dataPost, files, userInfo);
        console.log("Post created event published:", result);
        // publish to kafka

        const dataPayload = { ...result.post, hashtagUpdate: result.hashtagUpdate }
        const postMessageDto = plainToInstance(PostPayloadDTO, dataPayload, { excludeExtraneousValues: true });
        console.log("postMessageDto created event published:", postMessageDto);
        const publisher = new PostPublisher(EventTypes.POST_CREATED, userInfo);

        publisher.publish(postMessageDto);

        // response to client
        const postDto = plainToInstance(PostDTO, result.post, { excludeExtraneousValues: true });
        return responseFomat(res, postDto, "Post created successfully");
    } catch (error: any) {
        next(error);
    }
};

export const updatePostCtrl = async (req: Request<{ id: string }, {}, UpdatePostRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userInfo = req.user as UserInfo;
        let updateData = req.body;
        const files = Array.isArray(req?.files) ? req.files : undefined;

        const result = await postService.updatePost(id, updateData, files, userInfo);

        // publish to kafka

        const dataPayload = { ...result.post, hashtagUpdate: result.hashtagUpdate }
        const postMessageDto = plainToInstance(PostPayloadDTO, dataPayload, { excludeExtraneousValues: true });
        const publisher = new PostPublisher(EventTypes.POST_UPDATED, userInfo);
        publisher.publish(postMessageDto);

        const postDto = plainToInstance(PostDTO, result.post, { excludeExtraneousValues: true });
        return responseFomat(res, postDto, "Post updated successfully");
    } catch (error: any) {
        next(error);
    }
};

export const deletePostCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userInfo = req.user as UserInfo;
        const fileKeys = await postService.getFileKeys(id);
        const result = await postService.deletePost(id, fileKeys, userInfo);

        if (!result.post) {
            return responseFomat(res, null, "Post not found", false, 404);
        }
        // publish to kafka

        const dataPayload = { ...result.post, hashtagUpdate: result.hashtagUpdate }
        const postMessageDto = plainToInstance(DeletePostPayloadDTO, dataPayload, { excludeExtraneousValues: true });
        const publisher = new PostPublisher(EventTypes.POST_DELETED, userInfo);
        publisher.publish(postMessageDto);

        return responseFomat(res, null, "Post deleted successfully");
    } catch (error: any) {
        next(error);
    }
};

//POLL CONTROLLERS
export const createPollCtrl = async (req: Request<{}, {}, CreatePollRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const poll = req.body;
        const userInfo = req.user as UserInfo;
        const result = await postService.createPoll(poll, userInfo);

        // publish to kafka

        const dataPayload = { ...result.post, hashtagUpdate: result.hashtagUpdate }
        const postMessageDto = plainToInstance(PostPayloadDTO, dataPayload, { excludeExtraneousValues: true });
        const publisher = new PostPublisher(EventTypes.POST_CREATED, userInfo);
        publisher.publish(postMessageDto);

        const pollDto = plainToInstance(PollDTO, result.post, { excludeExtraneousValues: true });
        return responseFomat(res, pollDto, "Poll created successfully");
    } catch (error: any) {
        next(error);
    }
};

export const updatePollCtrl = async (req: Request<{ id: string }, {}, UpdateQuoteAndPollPostRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userInfo = req.user as UserInfo;
        let updateData = req.body;

        const result = await postService.updatePoll(id, updateData, userInfo);

        // publish to kafka

        const dataPayload = { ...result.post, hashtagUpdate: result.hashtagUpdate }
        const postMessageDto = plainToInstance(PostPayloadDTO, dataPayload, { excludeExtraneousValues: true });
        const publisher = new PostPublisher(EventTypes.POST_UPDATED, userInfo);
        publisher.publish(postMessageDto);

        const pollDto = plainToInstance(PollDTO, result.post, { excludeExtraneousValues: true });
        return responseFomat(res, pollDto, "Poll updated successfully");
    } catch (error: any) {
        next(error);
    }
};

//QUOTE POST CONTROLLERS
export const createQuotePostCtrl = async (req: Request<{}, {}, CreateQuotePostRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const quotePost = req.body;
        const userInfo = req.user as UserInfo;
        const result = await postService.createQuotePost(quotePost, userInfo);

        // publish to kafka
        const dataPayload = { ...result.post, hashtagUpdate: result.hashtagUpdate }
        const postMessageDto = plainToInstance(PostPayloadDTO, dataPayload, { excludeExtraneousValues: true });
        const publisher = new PostPublisher(EventTypes.POST_CREATED, userInfo);
        publisher.publish(postMessageDto);

        const quotePostDto = plainToInstance(QuotePostDTO, result.post, { excludeExtraneousValues: true });
        return responseFomat(res, quotePostDto, "Quote post created successfully");
    } catch (error) {
        next(error);
    }
}

export const updateQuotePostCtrl = async (req: Request<{ id: string }, {}, UpdateQuoteAndPollPostRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        let updateData = req.body;
        const userInfo = req.user as UserInfo;
        const result = await postService.updateQuotePost(id, updateData, userInfo);

        // publish to kafka

        const dataPayload = { ...result.post, hashtagUpdate: result.hashtagUpdate }
        const postMessageDto = plainToInstance(PostPayloadDTO, dataPayload, { excludeExtraneousValues: true });
        const publisher = new PostPublisher(EventTypes.POST_UPDATED, userInfo);
        publisher.publish(postMessageDto);

        const quotePostDto = plainToInstance(QuotePostDTO, result.post, { excludeExtraneousValues: true });
        return responseFomat(res, quotePostDto, "Quote post updated successfully");
    } catch (error: any) {
        next(error);
    }
};




//GET CONTROLLERS
export const getPostByIdUserCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;

        const posts = await postService.getPostsByUser(id, limit, page);

        if (!posts) {
            return responseFomat(res, null, "User id not found", false, 404);
        }

        // Transform posts based on their type
        const postsDto = posts.map(post => {
            if (post.type === 'poll') {
                return plainToInstance(PollDTO, post, { excludeExtraneousValues: true });
            } else if (post.type === 'quote') {
                return plainToInstance(QuotePostDTO, post, { excludeExtraneousValues: true });
            } else {
                return plainToInstance(PostDTO, post, { excludeExtraneousValues: true });
            }
        });

        return responseFomat(res, postsDto, "Post retrieved successfully");
    } catch (error: any) {
        next(error);
    }
};

export const getLikedPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userInfo = req.user as UserInfo;
        console.log("userInfo", userInfo);
        const posts = await postService.getLikedPostsByUser(userInfo._id, +page, +limit);

        return res.status(200).json({
            message: "Get list of successfully liked posts",
            data: posts
        });
    } catch (error) {
        next(error);
    }
};

export const getCommentedPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const userInfo = req.user as UserInfo;

        const data = await postService.getCommentedPostsByUser(
            userInfo._id,
            page,
            limit
        );

        return res.status(200).json({
            message: "Get list of successfully commented posts",
            data
        });
    } catch (err) {
        next(err);
    }
};


export const getQuotedPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const userInfo = req.user as UserInfo;

        const data = await postService.getQuotedPostsByUser(
            userInfo._id,
            page,
            limit
        );

        return res.status(200).json({
            message: "Get list of successfully quoted posts",
            data
        });
    } catch (error) {
        next(error);
    }
};