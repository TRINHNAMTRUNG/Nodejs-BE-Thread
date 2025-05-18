import mongoose, { Types } from "mongoose";
import PostModel from "./postModel";
import * as hashtagService from "../hashtags/hashtagService";
import { deleteManyObjectS3, pushManyObjectS3 } from "../../utils/s3FileManager";
import { AppError } from "../../utils/AppError";
import { CreatePollRequestDTO, CreatePostRequestDTO, UpdatePostRequestDTO, UpdateQuoteAndPollPostRequestDTO, CreateQuotePostRequestDTO } from "./postRequest.dto";
import { TypePost } from "../../constants/postEnum";
import { NewFile, Urls, UserInfo } from "../../interfaces";
import httpStatusCode from "http-status";
import { VoteModel } from "../votes/voteModel";
import { CommentModel } from "../comments/commentModel";

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

export const getPostsByUser = async (user_id: string, limit: number, page: number) => {
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

export const getLikedPostsByUser = async (user_id: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    // 1. Lấy danh sách post_id user đã like
    const likedVotes = await VoteModel.find({
        user_id: new mongoose.Types.ObjectId(user_id),
        target_type: "Post"
    })
        .select("target_id -_id")
        .lean();

    const likedPostIds = likedVotes.map(vote => vote.target_id);

    if (likedPostIds.length === 0) return [];

    // 2. Lấy thông tin post tương ứng
    const posts = await PostModel.find({
        _id: { $in: likedPostIds }
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    return posts;
};

export const getCommentedPostsByUser = async (
    userId: string,
    page = 1,
    limit = 10
) => {
    const skip = (page - 1) * limit;
    const userObjId = new mongoose.Types.ObjectId(userId);

    // 1. Lấy danh sách post_id mà user đã comment (distinct)
    const commentedPostIds = await CommentModel.distinct("post_id", { user_id: userObjId });

    if (commentedPostIds.length === 0) return [];

    // 2. Lấy thông tin bài viết tương ứng, sắp xếp mới nhất
    const posts = await PostModel.find({ _id: { $in: commentedPostIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    return posts;
};

export const createPost = async (post: CreatePostRequestDTO, files: Express.Multer.File[] | undefined, userInfo: UserInfo) => {
    // console.log("LOGS SVC: ", post);
    const { hashtags = [] } = post;
    const hashtagTask = hashtagService.findOrCreateHashtags(hashtags, []);
    const filesTask = files ? pushManyObjectS3Svc(files) : Promise.resolve([]);
    const [hashtagUpdate, newUrls] = await Promise.all([hashtagTask, filesTask]);

    const newData = { ...post, urls: newUrls, type: TypePost.NORMAL, creator_id: userInfo._id };
    const newPost = await PostModel.create(newData);
    return { post: newPost.toObject(), hashtagUpdate };
};

export const updatePost = async (postId: string, data: UpdatePostRequestDTO, files: Express.Multer.File[] | undefined, userInfo: UserInfo) => {
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
    // check owner
    if (existingPost?.creator_id.toString() !== userInfo._id.toString()) {
        throw AppError.logic("You are not the owner of this post", 403, httpStatusCode["403_NAME"]);
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
    // const hashtagTask = hashtags.length ? hashtagService.findOrCreateHashtags(hashtags, existingPost.hashtags) : Promise.resolve([]);
    const hashtagTask = hashtagService.findOrCreateHashtags(hashtags, existingPost.hashtags);
    // 4. Handle file deletions if requested
    const deleteTask = deleteKeys.length ? deleteManyObjectS3(deleteKeys) : Promise.resolve([]);
    // 5. Upload any new files
    const uploadTask = files?.length ? pushManyObjectS3Svc(files) : Promise.resolve([]);
    // 6. Wait for all tasks to complete
    const [failedKeys, newUrls, hashtagUpdate] = await Promise.all([deleteTask, uploadTask, hashtagTask]);
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
    if (!updatedPost) {
        throw AppError.logic("Update failed", 400, httpStatusCode["400_NAME"]);
    }

    return { post: updatedPost.toObject(), hashtagUpdate };
};

export const deletePost = async (postId: string, urlKeys: string[], userInfo: UserInfo) => {
    const [failedKeys, deletedPost] = await Promise.all([
        deleteManyObjectS3(urlKeys),
        PostModel.findOneAndDelete({ _id: postId, creator_id: userInfo._id })
    ]);
    if (!deletedPost) {
        throw AppError.logic("Delete failed", 400, httpStatusCode["400_NAME"]);
    }
    if (failedKeys.length > 0) {
        console.warn("Some files failed to delete from S3:", failedKeys);
    }

    // Nếu là bài quote thì giảm quote_post_count của bài gốc
    if (deletedPost.type === TypePost.QUOTE && deletedPost.quoted_post_id) {
        await PostModel.updateOne(
            { _id: deletedPost.quoted_post_id },
            { $inc: { quote_post_count: -1 } }
        );
    }

    const hashtagUpdate = await hashtagService.findOrCreateHashtags([], deletedPost.hashtags);
    return { post: deletedPost.toObject(), hashtagUpdate };
};

//POLL SERVICES
export const createPoll = async (data: CreatePollRequestDTO, userInfo: UserInfo) => {
    const { hashtags = [] } = data;

    const hashtagTask = hashtagService.findOrCreateHashtags(hashtags, []);
    const createPostTask = PostModel.create({ ...data, type: TypePost.POLL, creator_id: userInfo._id });
    const [hashtagUpdate, newPost] = await Promise.all([hashtagTask, createPostTask]);

    return { post: newPost.toObject(), hashtagUpdate };
};

export const updatePoll = async (postId: string, data: UpdateQuoteAndPollPostRequestDTO, userInfo: UserInfo) => {
    const { hashtags = [] } = data;
    const isEmptyUpdate = Object.values(data).every(value => value === undefined);
    if (isEmptyUpdate) {
        throw AppError.logic("At least one field must be updated", 400, httpStatusCode["400_NAME"]);
    }
    const pollPostExisting = await PostModel.findOne({ _id: new mongoose.Types.ObjectId(postId), type: TypePost.POLL });
    if (!pollPostExisting) {
        throw AppError.logic("Poll post not found", 404, httpStatusCode["404_NAME"]);
    }
    // check owner
    if (pollPostExisting?.creator_id.toString() !== userInfo._id.toString()) {
        throw AppError.logic("You are not the owner of this post", 403, httpStatusCode["403_NAME"]);
    }
    const updatedPoll = await PostModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(postId),
        { $set: data },
        { new: true }
    );
    if (!updatedPoll) {
        throw AppError.logic("Poll post not found", 404, httpStatusCode["404_NAME"]);
    }
    const hashtagUpdate = await hashtagService.findOrCreateHashtags(hashtags, pollPostExisting.hashtags);
    return { post: updatedPoll.toObject(), hashtagUpdate };
}

//QUOTE POST SERVICES
export const createQuotePost = async (data: CreateQuotePostRequestDTO, userInfo: UserInfo) => {
    const { hashtags, quoted_post_id } = data;
    const hashtagTask = hashtagService.findOrCreateHashtags(hashtags, []);
    const createPostTask = PostModel.create({ ...data, type: TypePost.QUOTE, creator_id: userInfo._id });
    const updateQuotePostCountTask = PostModel.updateOne({ _id: quoted_post_id }, { $inc: { quote_post_count: 1 } })
    const [hashtagUpdate, newPost] = await Promise.all([hashtagTask, createPostTask, updateQuotePostCountTask]);

    return { post: newPost.toObject(), hashtagUpdate };
}

export const updateQuotePost = async (postId: string, data: UpdateQuoteAndPollPostRequestDTO, userInfo: UserInfo) => {
    const { hashtags = [] } = data;

    const isEmptyUpdate = Object.values(data).every(value => value === undefined);
    if (isEmptyUpdate) {
        throw AppError.logic("At least one field must be updated", 400, httpStatusCode["400_NAME"]);
    }
    const quotePostExisting = await PostModel.findOne({ _id: new mongoose.Types.ObjectId(postId), type: TypePost.QUOTE });
    if (!quotePostExisting) {
        throw AppError.logic("Quote post not found", 404, httpStatusCode["404_NAME"]);
    }
    // check owner
    if (quotePostExisting?.creator_id.toString() !== userInfo._id.toString()) {
        throw AppError.logic("You are not the owner of this post", 403, httpStatusCode["403_NAME"]);
    }
    const updatedQuotePost = await PostModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(postId),
        { $set: data },
        { new: true }
    );
    if (!updatedQuotePost) {
        throw AppError.logic("Quote post not found", 404, httpStatusCode["404_NAME"]);
    }
    const hashtagUpdate = await hashtagService.findOrCreateHashtags(hashtags, quotePostExisting.hashtags);
    return { post: updatedQuotePost.toObject(), hashtagUpdate };
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