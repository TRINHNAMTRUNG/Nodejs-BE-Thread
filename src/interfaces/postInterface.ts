import { Schema } from "mongoose";
interface UserTag {
    id: Schema.Types.ObjectId;
    name: string;
}

interface PollOption {
    content: string;
    vote_count: number;
    voters: Schema.Types.ObjectId[];
}

interface Poll {
    end_at: Date;
    status_poll: string;
    poll_options: PollOption[];
}

//REQUEST CREATE POST
export interface createPostReq {
    creator_id: Schema.Types.ObjectId;
    reply_to: Schema.Types.ObjectId;
    content: string;
    visibility: string;
    reply_count: number;
    like_count: number;
    comment_count: number;
    save_post_count: number;
    images?: string[];
    user_tags?: UserTag[];
    hashtags?: string[];
    poll?: Poll;
    createdAt: Date;
}

export interface updatePostReq {
    content?: string;
    visibility?: string;
    images?: string[];
    user_tags?: UserTag[];
    hashtags?: string[];
    poll?: Poll;
}