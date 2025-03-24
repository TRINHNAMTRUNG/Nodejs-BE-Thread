import mongoose, { Types } from "mongoose";
import PostModel from "./postModel";
import { createPostReq, updatePostReq, Urls, NewFile, createPollReq, updatePollReq } from "../../interfaces/index";
import * as hashtagService from "../../domains/hashtag/hashtagService";
import { deleteManyObjectS3, pushManyObjectS3 } from "../../utils/s3FileManager";
import { AppError } from "../../utils/responseFomat";
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

export const createPost = async (data: createPostReq, files: Express.Multer.File[] | undefined) => {
    try {
        if (data?.hashtags?.length) {
            await hashtagService.findOrCreateHashtags(data.hashtags);
        }
        const newUrls: Urls[] = await pushManyObjectS3Svc(files);
        const newData = { ...data, urls: newUrls };
        const newPost = await PostModel.create(newData);
        return newPost.toObject();
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
};

export const createPoll = async (data: createPollReq) => {
    try {
        if (data?.hashtags?.length) {
            await hashtagService.findOrCreateHashtags(data.hashtags);
        }

        const newPost = await PostModel.create(data);
        return newPost.toObject();
    } catch (error) {
        console.error("Error creating poll:", error);
        throw error;
    }
};

export const updatePoll = async (postId: string, data: updatePollReq) => {
    try {
        const updatedPoll = await PostModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(postId),
            { $set: data },
            { new: true }
        );
        if (!updatedPoll) {
            throw new AppError("Poll not found", 404);
        }
        return updatedPoll;
    } catch (error) {
        console.error("Error updating poll:", error);
        throw error;
    }
}

export const updatePost = async (postId: string, data: updatePostReq, files: Express.Multer.File[] | undefined) => {
    try {
        const { hashtags, deleteKeys, noUpdateKeys } = data;

        // 1. Get the existing post to verify it exists
        const existingPost = await PostModel.findById(postId);
        if (!existingPost) {
            throw new AppError("Post not found", 404);
        }

        const existingKeys = existingPost.urls.map(url => url.key);
        const validateKeys = (keys: string[], fieldName: string) => {
            const invalidKeys = keys.filter(key => !existingKeys.includes(key));
            if (invalidKeys.length > 0)
                throw new AppError(`Invalid ${fieldName}: ${invalidKeys.join("; ")}`, 400);
        };

        if (deleteKeys.length) validateKeys(deleteKeys, "deleteKeys");
        if (noUpdateKeys.length) validateKeys(noUpdateKeys, "noUpdateKeys");

        // 2. Process hashtags if provided
        const hashtagTask = hashtags.length ? hashtagService.findOrCreateHashtags(hashtags) : Promise.resolve();
        // 3. Handle file deletions if requested
        const deleteTask = deleteKeys.length ? deleteManyObjectS3(deleteKeys) : Promise.resolve([]);
        // 4. Upload any new files
        const uploadTask = files?.length ? pushManyObjectS3Svc(files) : Promise.resolve([]);
        // 5. Wait for all tasks to complete
        const [failedKeys, newUrls] = await Promise.all([deleteTask, uploadTask, hashtagTask]);
        // 6. Handle URLs update
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