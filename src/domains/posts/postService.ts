import mongoose, { Types } from "mongoose";
import PostModel from "./postModel";
import { createPostReq, updatePostReq, Urls, NewFile, createPollReq, updatePollReq, createQuotePostReq, updateQuotePostReq, voteAPollOptionReq } from "../../interfaces/index";
import * as hashtagService from "../hashtags/hashtagService";
import { deleteManyObjectS3, pushManyObjectS3 } from "../../utils/s3FileManager";
import { AppError } from "../../utils/responseFomat";
import { CreatePollRequestDTO, CreatePostRequestDTO, UpdatePostRequestDTO, UpdateQuoteAndPollPostRequestDTO } from "./postRequest.dto";
import { TypePost } from "../../constants/postEnum";

const pushManyObjectS3Svc = async (files: Express.Multer.File[] | undefined): Promise<Urls[]> => {
    if (!files || files.length === 0) {
        return [];
    }

    const listFile: NewFile[] = files.map(e => ({
        buffer: e.buffer,
        contentType: e.mimetype,
        fileName: e.originalname
    }));

    return await pushManyObjectS3(listFile);
};

// POST SERVICES
export const createPost = async (post: CreatePostRequestDTO, files: Express.Multer.File[] | undefined) => {
    try {
        console.log("LOGS SVC: ", post);
        const { hashtags = [] } = post;
        const hashtagTask = hashtags?.length > 0 ? hashtagService.findOrCreateHashtags(post.hashtags) : Promise.resolve();
        const filesTask = files ? pushManyObjectS3Svc(files) : Promise.resolve([]);
        const [_, newUrls] = await Promise.all([hashtagTask, filesTask]);

        const newData = { ...post, urls: newUrls, type: TypePost.NORMAL };
        const newPost = await PostModel.create(newData);
        return newPost.toObject();
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
};

export const updatePost = async (postId: string, data: UpdatePostRequestDTO, files: Express.Multer.File[] | undefined) => {
    try {
        const { hashtags = [], deleteKeys = [], noUpdateKeys = [] } = data;
        const isEmptyUpdate = Object.values(data).every(value => value === undefined);
        if (isEmptyUpdate) {
            throw new AppError("At least one field must be updated", 400);
        }
        // 1. Get the existing post to verify it exists
        const existingPost = await PostModel.findOne({ _id: new mongoose.Types.ObjectId(postId), type: TypePost.POLL });
        if (!existingPost) {
            throw new AppError("Normal post not found", 404);
        }
        // 2. Validate keys in deleteKeys and noUpdateKeys
        const existingKeys = existingPost.urls.map(url => url.key);
        const validateKeys = (keys: string[], fieldName: string) => {
            const invalidKeys = keys.filter(key => !existingKeys.includes(key));
            if (invalidKeys.length > 0)
                throw new AppError(`Invalid ${fieldName}: ${invalidKeys.join("; ")}`, 400);
        };
        if (deleteKeys.length) validateKeys(deleteKeys, "deleteKeys");
        if (noUpdateKeys.length) validateKeys(noUpdateKeys, "noUpdateKeys");
        // 3. Process hashtags if provided
        const hashtagTask = hashtags.length ? hashtagService.findOrCreateHashtags(hashtags) : Promise.resolve();
        // 4. Handle file deletions if requested
        const deleteTask = deleteKeys.length ? deleteManyObjectS3(deleteKeys) : Promise.resolve([]);
        // 5. Upload any new files
        const uploadTask = files?.length ? pushManyObjectS3Svc(files) : Promise.resolve([]);
        // 6. Wait for all tasks to complete
        const [failedKeys, newUrls] = await Promise.all([deleteTask, uploadTask, hashtagTask]);
        // 7. Handle URLs update
        const currentUrls = existingPost.urls || [];
        const keptUrls = currentUrls.filter(url => noUpdateKeys.includes(url.key) && !deleteKeys.includes(url.key));
        const filteredData: Partial<updatePostReq> = { ...data };
        delete filteredData.deleteKeys;
        delete filteredData.noUpdateKeys;
        const updateObj = { ...filteredData, urls: [...keptUrls, ...newUrls] };
        // 8. Update the post
        const updatedPost = await PostModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(postId),
            { $set: updateObj },
            { new: true }
        );

        return updatedPost ? updatedPost.toObject() : null;
    } catch (error) {
        console.error("Error updating post:", error);
        throw error;
    }
};

export const deletePost = async (postId: string, urlKeys: string[]): Promise<boolean> => {
    try {
        const [failedKeys, deletedPost] = await Promise.all([
            deleteManyObjectS3(urlKeys),
            PostModel.findByIdAndDelete(postId)
        ]);

        if (failedKeys.length > 0) {
            console.warn("Some files failed to delete from S3:", failedKeys);
        }

        return deletedPost ? true : false;
    } catch (error) {
        console.error("Error in deletePost:", error);
        throw new Error("Internal server error");
    }
};

//POLL SERVICES
export const createPoll = async (data: CreatePollRequestDTO) => {
    try {
        const { hashtags = [] } = data;

        const hashtagTask = hashtags.length > 0 ? hashtagService.findOrCreateHashtags(hashtags) : Promise.resolve();
        const createPostTask = PostModel.create({ ...data, type: TypePost.POLL });
        const [_, newPost] = await Promise.all([hashtagTask, createPostTask]);

        return newPost.toObject();
    } catch (error) {
        console.error("Error creating poll:", error);
        throw error;
    }
};

export const updatePoll = async (postId: string, data: UpdateQuoteAndPollPostRequestDTO) => {
    try {
        const { hashtags = [] } = data;
        const isEmptyUpdate = Object.values(data).every(value => value === undefined);
        if (isEmptyUpdate) {
            throw new AppError("At least one field must be updated", 400);
        }
        const pollPostExisting = await PostModel.findOne({ _id: new mongoose.Types.ObjectId(postId), type: TypePost.POLL });
        if (!pollPostExisting) {
            throw new AppError("Poll post not found", 404);
        }
        const updatedPoll = await PostModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(postId),
            { $set: data },
            { new: true }
        );
        hashtags.length && await hashtagService.findOrCreateHashtags(hashtags);
        return updatedPoll;
    } catch (error) {
        console.error("Error updating poll:", error);
        throw error;
    }
}

//QUOTE POST SERVICES
export const createQuotePost = async (data: createQuotePostReq) => {
    try {
        const { hashtags } = data;
        const hashtagTask = hashtags !== undefined && hashtags.length > 0 ? hashtagService.findOrCreateHashtags(hashtags) : Promise.resolve();
        const createPostTask = PostModel.create({ ...data, type: TypePost.QUOTE });
        const [_, newPost] = await Promise.all([hashtagTask, createPostTask]);

        // update qoute_post_count in main post
        await PostModel.updateOne({ _id: newPost.quoted_post_id }, { $inc: { quote_post_count: 1 } })
        return newPost.toObject();
    } catch (error) {
        console.error("Error creating quote post:", error);
        throw error;
    }
}

export const updateQuotePost = async (postId: string, data: UpdateQuoteAndPollPostRequestDTO) => {
    try {
        const { hashtags = [] } = data;
        hashtags.length && await hashtagService.findOrCreateHashtags(hashtags);
        const isEmptyUpdate = Object.values(data).every(value => value === undefined);
        if (isEmptyUpdate) {
            throw new AppError("At least one field must be updated", 400);
        }
        const quotePostExisting = await PostModel.findOne({ _id: new mongoose.Types.ObjectId(postId), type: TypePost.QUOTE });
        if (!quotePostExisting) {
            throw new AppError("Quote post not found", 404);
        }
        const updatedQuotePost = await PostModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(postId),
            { $set: data },
            { new: true }
        );
        return updatedQuotePost;
    } catch (error) {
        console.error("Error updating quote post:", error);
        throw error;
    }
}

// GET SERVICES
export const getFileKeys = async (postId: string): Promise<string[]> => {
    try {
        const result = await PostModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(postId) } },
            {
                $project: {
                    urlKeys: { $ifNull: [{ $map: { input: "$urls", as: "url", in: "$$url.key" } }, []] },
                    _id: 0
                }
            }
        ]);

        return result.length > 0 ? result[0].urlKeys : [];
    } catch (error) {
        console.error("Database error in getFileKeys:", error);
        throw new Error("Internal server error");
    }
};

export const getPostByUserId = async (userId: string, limit: number = 10, page: number = 1) => {
    try {
        const posts = await PostModel.find({ creator_id: new mongoose.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return posts.map(post => post.toObject());
    } catch (error) {
        console.error("Error in getPostByUserId:", error);
        throw error;
    }
};

export const getAllPosts = async () => {
    try {
        const posts = await PostModel.find().sort({ createdAt: -1 });
        return posts.map(post => post.toObject());
    } catch (error) {
        console.error("Error in getAllPosts:", error);
        throw error;
    }
};