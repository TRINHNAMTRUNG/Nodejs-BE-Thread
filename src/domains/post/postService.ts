import mongoose, { Types } from "mongoose";
import PostModel from "./postModel";
import { createPostReq, updatePostReq, Urls, NewFile, createPollReq } from "../../interfaces/index";
import * as hashtagService from "../../domains/hashtag/hashtagService";
import { deleteManyObjectS3, pushManyObjectS3 } from "../../utils/s3FileManager";

const pushManyObjectS3Svc = async (files: Express.Multer.File[] | undefined): Promise<Urls[]> => {
    let newUrls: Urls[] = [];
    if (files !== undefined) {
        let listFile: NewFile[] = files?.map(e => {
            return {
                buffer: e.buffer,
                contentType: e.mimetype,
                fileName: e.originalname
            }
        })
        newUrls = await pushManyObjectS3(listFile);
    }
    return newUrls;
}

export const createPost = async (data: createPostReq, files: Express.Multer.File[] | undefined) => {

    if (data?.hashtags) {
        await hashtagService.findOrCreateHashtags(data.hashtags);
    }
    let newUrls: Urls[] = await pushManyObjectS3Svc(files);
    const newData = { ...data, urls: newUrls };
    const newPost = await PostModel.create(newData);
    return newPost.toObject();
};
export const createPoll = async (data: createPollReq) => {
    if (data?.hashtags) {
        await hashtagService.findOrCreateHashtags(data.hashtags);
    }
    const newPost = await PostModel.create(data);
    return newPost.toObject();
};
//     content?: string;
//     visibility?: string;
//     noUpdateKeys?: string[];
//     user_tags?: UserTag[];
//     hashtags?: string[];

export const updatePost = async (postId: string, data: updatePostReq, files: Express.Multer.File[] | undefined) => {
    let failedKeys: string[];
    let newUrls: Urls[] = [];
    let updatedPost;
    // Xóa các ảnh cần xóa trên s3
    if (data.deleteKeys.length > 0) {
        failedKeys = await deleteManyObjectS3(data.deleteKeys);
    }
    // Thêm các ảnh mới cần thêm trên s3
    newUrls = await pushManyObjectS3Svc(files);
    // update urls[] dưới db
    if (data.noUpdateKeys.length > 0) {
        const noUpdateKeys = data.noUpdateKeys;
        if (data?.hashtags) {
            await hashtagService.findOrCreateHashtags(data.hashtags);
        }
        updatedPost = await PostModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(postId) },
            {
                $set: {
                    ...data,
                    urls: {
                        $concatArrays: [
                            {
                                $filter: {
                                    input: "$urls",
                                    as: "item",
                                    cond: { $in: ["$$item.key", noUpdateKeys] } // Giữ lại key thuộc `noUpdateKeys`
                                }
                            },
                            newUrls // Thêm mới hoặc cập nhật phần còn lại
                        ],
                    },
                },
            },
            { new: true }
        );
    }
    return updatedPost ? updatedPost.toObject() : null;
};



export const getFileKeys = async (postId: string): Promise<string[]> => {
    try {
        const result = await PostModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(postId) } },
            {
                $project: {
                    urlKeys: { $ifNull: ["$urls.key", []] },
                    _id: 0
                }
            }
        ]);
        return result.length > 0 ? result[0].urlKeys : [];
    } catch (error) {
        console.log("Database error in getFileKeys: ", error);
        throw new Error("Internal server error")
    }
}

export const deletePost = async (postId: string, urlKeys: string[]): Promise<boolean> => {
    try {
        const [failedKeys, deletePost] = await Promise.all([
            deleteManyObjectS3(urlKeys), // Xóa file trên S3
            PostModel.findByIdAndDelete(postId) // Xóa post khỏi MongoDB
        ]);
        if (failedKeys.length > 0) {
            console.warn("Some files failed to delete from S3:", failedKeys);
        }
        return deletePost ? true : false;
    } catch (error) {
        console.log("Database error in getFileKeys: ", error);
        throw new Error("Internal server error");
    }
};

export const getPostByUserId = async (userId: string, limit: number, page: number) => {
    const posts = await PostModel.find({ creator_id: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 }) // Sắp xếp bài viết mới nhất trước
        .skip((+page - 1) * +limit) // Bỏ qua các trang trước đó
        .limit(+limit);
    return posts ? postMessage : null;
};

export const getAllPosts = async () => {
    const posts = await PostModel.find();
    return posts.map(post => post.toObject());
};