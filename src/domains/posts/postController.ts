import { Request, Response, NextFunction } from "express";
import * as postService from "./postService";
import { responseFomat } from "../../utils/responseFomat";
import { PollDTO, PostDTO, QuotePostDTO } from "./postResponse.dto";
import { plainToInstance } from "class-transformer";
import { CreatePollRequestDTO, CreatePostRequestDTO, CreateQuotePostRequestDTO, UpdatePostRequestDTO, UpdateQuoteAndPollPostRequestDTO } from "./postRequest.dto";
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

        // Use appropriate DTO based on post type
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

export const getPostsByUserCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = req.params;
        const { page = 1, limit = 8 } = req.query;

        const posts = await postService.getPostsByUser(user_id, Number(page), Number(limit));

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
        const post = req.body;

        const files = Array.isArray(req?.files) ? req.files : undefined;
        const newPost = await postService.createPost(post, files);

        const postDto = plainToInstance(PostDTO, newPost, { excludeExtraneousValues: true });
        return responseFomat(res, postDto, "Post created successfully");
    } catch (error: any) {
        next(error);
    }
};

export const updatePostCtrl = async (req: Request<{ id: string }, {}, UpdatePostRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        let updateData = req.body;
        const files = Array.isArray(req?.files) ? req.files : undefined;

        const updatedPost = await postService.updatePost(id, updateData, files);
        // console.log("updatedPost obj:", JSON.stringify(updatedPost, null, 2));

        const postDto = plainToInstance(PostDTO, updatedPost, { excludeExtraneousValues: true });
        // console.log("postDto: >>>", postDto);
        return responseFomat(res, postDto, "Post updated successfully");
    } catch (error: any) {
        next(error);
    }
};

export const deletePostCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const fileKeys = await postService.getFileKeys(id);
        const deletedPost = await postService.deletePost(id, fileKeys);

        if (!deletedPost) {
            return responseFomat(res, null, "Post not found", false, 404);
        }

        return responseFomat(res, null, "Post deleted successfully");
    } catch (error: any) {
        next(error);
    }
};

//POLL CONTROLLERS
export const createPollCtrl = async (req: Request<{}, {}, CreatePollRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const poll = req.body;
        const newPoll = await postService.createPoll(poll);

        const pollDto = plainToInstance(PollDTO, newPoll, { excludeExtraneousValues: true });
        return responseFomat(res, pollDto, "Poll created successfully");
    } catch (error: any) {
        next(error);
    }
};

export const updatePollCtrl = async (req: Request<{ id: string }, {}, UpdateQuoteAndPollPostRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        // const defaultFields = {
        //     hashtags: [],
        //     user_tags: []
        // };
        let updateData = req.body;

        const updatedPoll = await postService.updatePoll(id, updateData);

        const pollDto = plainToInstance(PollDTO, updatedPoll, { excludeExtraneousValues: true });
        return responseFomat(res, pollDto, "Poll updated successfully");
    } catch (error: any) {
        next(error);
    }
};

//QUOTE POST CONTROLLERS
export const createQuotePostCtrl = async (req: Request<{}, {}, CreateQuotePostRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const quotePost = req.body;
        const newQuotePost = await postService.createQuotePost(quotePost);

        const quotePostDto = plainToInstance(QuotePostDTO, newQuotePost, { excludeExtraneousValues: true });
        return responseFomat(res, quotePostDto, "Quote post created successfully");
    } catch (error) {
        next(error);
    }
}

export const updateQuotePostCtrl = async (req: Request<{ id: string }, {}, UpdateQuoteAndPollPostRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        // const defaultFields = {
        //     hashtags: [],
        //     user_tags: []
        // };
        let updateData = req.body;

        const updatedQuotePost = await postService.updateQuotePost(id, updateData);

        const quotePostDto = plainToInstance(QuotePostDTO, updatedQuotePost, { excludeExtraneousValues: true });
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

        const posts = await postService.getPostByUserId(id, limit, page);

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

