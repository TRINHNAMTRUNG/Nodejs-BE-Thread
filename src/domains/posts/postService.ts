import mongoose, { Types } from "mongoose";
import PostModel from "./postModel";
import * as hashtagService from "../hashtags/hashtagService";
import { deleteManyObjectS3, pushManyObjectS3 } from "../../utils/s3FileManager";
import { AppError } from "../../utils/AppError";
import { CreatePollRequestDTO, CreatePostRequestDTO, UpdatePostRequestDTO, UpdateQuoteAndPollPostRequestDTO, CreateQuotePostRequestDTO } from "./postRequest.dto";
import { TypePost } from "../../constants/postEnum";
import { NewFile, Urls } from "../../interfaces";
import httpStatusCode from "http-status";

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

export const getRandomPosts = async (page: number, limit: number) => {
    const skip = (page - 1) * limit;

    return await PostModel.find()
        .sort({ createdAt: -1 }) // Sắp xếp bài viết mới nhất đến cũ nhất
        .skip(skip)
        .limit(limit)
        .lean();
};

export const getPostById = async (id: string) => {
    return await PostModel.findById(id).lean();
};

export const getPostsByUser = async (user_id: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    return await PostModel.find({ creator_id: user_id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

export const getPostsByHashtag = async (hashtag: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    return await PostModel.find({ hashtags: hashtag })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

export const searchPosts = async (query: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    return await PostModel.find({ content: { $regex: query, $options: "i" } }) // Tìm kiếm không phân biệt hoa thường
        .sort({ createdAt: -1 }) // Sắp xếp bài viết mới nhất trước
        .skip(skip)
        .limit(limit)
        .lean();
};

export const createPost = async (post: CreatePostRequestDTO, files: Express.Multer.File[] | undefined) => {
    // console.log("LOGS SVC: ", post);
    const { hashtags = [] } = post;
    const hashtagTask = hashtags?.length > 0 ? hashtagService.findOrCreateHashtags(post.hashtags) : Promise.resolve();
    const filesTask = files ? pushManyObjectS3Svc(files) : Promise.resolve([]);
    const [_, newUrls] = await Promise.all([hashtagTask, filesTask]);

    const newData = { ...post, urls: newUrls, type: TypePost.NORMAL };
    const newPost = await PostModel.create(newData);
    return newPost.toObject();
};

export const updatePost = async (postId: string, data: UpdatePostRequestDTO, files: Express.Multer.File[] | undefined) => {
    const { hashtags = [], deleteKeys = [], noUpdateKeys = [] } = data;
    const isEmptyUpdate = Object.values(data).every(value => value === undefined);
    if (isEmptyUpdate) {
        throw AppError.logic("At least one field must be updated", 400, httpStatusCode["400_NAME"]);
    }
    // 1. Get the existing post to verify it exists
    const existingPost = await PostModel.findOne({ _id: new mongoose.Types.ObjectId(postId), type: TypePost.NORMAL });
    if (!existingPost) {
        throw AppError.logic("Normal post not found", 404, httpStatusCode["404_NAME"]);
    }
    // 2. Validate keys in deleteKeys and noUpdateKeys
    const existingKeys = existingPost.urls.map(url => url.key);
    const validateKeys = (keys: string[], fieldName: string) => {
        const invalidKeys = keys.filter(key => !existingKeys.includes(key));
        if (invalidKeys.length > 0)
            throw AppError.logic(`Invalid ${fieldName}: ${invalidKeys.join("; ")}`, 400, httpStatusCode["400_NAME"]);
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
    const filteredData: Partial<UpdatePostRequestDTO> = { ...data };
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
};

export const deletePost = async (postId: string, urlKeys: string[]): Promise<boolean> => {
    const [failedKeys, deletedPost] = await Promise.all([
        deleteManyObjectS3(urlKeys),
        PostModel.findByIdAndDelete(postId)
    ]);

    if (failedKeys.length > 0) {
        console.warn("Some files failed to delete from S3:", failedKeys);
    }

    return deletedPost ? true : false;
};

//POLL SERVICES
export const createPoll = async (data: CreatePollRequestDTO) => {
    const { hashtags = [] } = data;

    const hashtagTask = hashtags.length > 0 ? hashtagService.findOrCreateHashtags(hashtags) : Promise.resolve();
    const createPostTask = PostModel.create({ ...data, type: TypePost.POLL });
    const [_, newPost] = await Promise.all([hashtagTask, createPostTask]);

    return newPost.toObject();
};

export const updatePoll = async (postId: string, data: UpdateQuoteAndPollPostRequestDTO) => {
    const { hashtags = [] } = data;
    const isEmptyUpdate = Object.values(data).every(value => value === undefined);
    if (isEmptyUpdate) {
        throw AppError.logic("At least one field must be updated", 400, httpStatusCode["400_NAME"]);
    }
    const pollPostExisting = await PostModel.findOne({ _id: new mongoose.Types.ObjectId(postId), type: TypePost.POLL });
    if (!pollPostExisting) {
        throw AppError.logic("Poll post not found", 404, httpStatusCode["404_NAME"]);
    }
    const updatedPoll = await PostModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(postId),
        { $set: data },
        { new: true }
    );
    hashtags.length && await hashtagService.findOrCreateHashtags(hashtags);
    return updatedPoll;
}

//QUOTE POST SERVICES
export const createQuotePost = async (data: CreateQuotePostRequestDTO) => {
    const { hashtags } = data;
    const hashtagTask = hashtags !== undefined && hashtags.length > 0 ? hashtagService.findOrCreateHashtags(hashtags) : Promise.resolve();
    const createPostTask = PostModel.create({ ...data, type: TypePost.QUOTE });
    const [_, newPost] = await Promise.all([hashtagTask, createPostTask]);

    // update qoute_post_count in main post
    await PostModel.updateOne({ _id: newPost.quoted_post_id }, { $inc: { quote_post_count: 1 } })
    return newPost.toObject();
}

export const updateQuotePost = async (postId: string, data: UpdateQuoteAndPollPostRequestDTO) => {
    const { hashtags = [] } = data;
    hashtags.length && await hashtagService.findOrCreateHashtags(hashtags);
    const isEmptyUpdate = Object.values(data).every(value => value === undefined);
    if (isEmptyUpdate) {
        throw AppError.logic("At least one field must be updated", 400, httpStatusCode["400_NAME"]);
    }
    const quotePostExisting = await PostModel.findOne({ _id: new mongoose.Types.ObjectId(postId), type: TypePost.QUOTE });
    if (!quotePostExisting) {
        throw AppError.logic("Quote post not found", 404, httpStatusCode["404_NAME"]);
    }
    const updatedQuotePost = await PostModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(postId),
        { $set: data },
        { new: true }
    );
    return updatedQuotePost;
}

// GET SERVICES
export const getFileKeys = async (postId: string): Promise<string[]> => {
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
};

export const getAllPosts = async () => {
    const posts = await PostModel.find().sort({ createdAt: -1 });
    return posts.map(post => post.toObject());
};