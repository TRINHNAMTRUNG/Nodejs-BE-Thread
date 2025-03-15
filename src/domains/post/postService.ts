import { Types } from "mongoose";
import PostModel from "./postModel";
import { createPostReq, updatePostReq } from "../../interfaces/index";
import * as hashtagService from "../../domains/hashtag/hashtagService";
export const createPost = async (data: createPostReq) => {
    if (data?.hashtags) {
        await hashtagService.findOrCreateHashtags(data.hashtags);
    }
    const newPost = await PostModel.create(data);
    return newPost.toObject(); // Chuyển đổi document thành object thuần túy
};

export const updatePost = async (postId: string, data: updatePostReq) => {
    const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        data,
        { new: true, runValidators: true }
    );
    return updatedPost ? updatedPost.toObject() : null;
};

export const deletePost = async (postId: string) => {
    const deletedPost = await PostModel.findByIdAndDelete(postId);
    return deletedPost ? deletedPost.toObject() : null;
};

export const getPostById = async (postId: string) => {
    const post = await PostModel.findById(postId);
    return post ? post.toObject() : null;
};

export const getAllPosts = async () => {
    const posts = await PostModel.find();
    return posts.map(post => post.toObject());
};