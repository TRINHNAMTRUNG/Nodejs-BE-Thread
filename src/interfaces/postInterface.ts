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

export interface NewFile {
    buffer: Buffer,
    contentType: string,
    fileName: string
};
export interface Urls {
    key: string;
    url: string
};

//REQUEST POST
export interface createPostReq {
    creator_id: Schema.Types.ObjectId;
    // reply_to: Schema.Types.ObjectId;
    content: string;
    visibility: string;
    // reply_count: number;
    // like_count: number;
    // comment_count: number;
    // save_post_count: number;
    hashtags?: string[];
    user_tags: UserTag[];
}

export interface createPollReq extends createPostReq {
    poll: Poll
}


export interface updatePostReq {
    content?: string;
    visibility?: string;
    noUpdateKeys: string[];
    deleteKeys: string[];
    user_tags: UserTag[];
    hashtags: string[];
}

