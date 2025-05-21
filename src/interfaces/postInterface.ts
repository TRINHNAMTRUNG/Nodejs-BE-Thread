import { Schema } from "mongoose";
interface UserTag {
    id: string;
    name: string;
}

interface PollOption {
    content: string;
    vote_count: number;
    voters: string[];
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
    creator_id: string;
    content: string;
    visibility: string;
    hashtags: string[];
    user_tags: UserTag[];
}
export interface updatePostReq {
    content?: string;
    visibility?: string;
    noUpdateKeys: string[];
    deleteKeys: string[];
    user_tags: UserTag[];
    hashtags: string[];
}

//REQUEST POLL
export interface createPollReq extends createPostReq {
    poll: Poll
}
export interface updatePollReq extends Omit<updatePostReq, "deleteKeys" | "noUpdateKeys"> { };
export interface voteAPollOptionReq {
    poll_option_id: string;
    user_id: string;
}

//REQUEST QUOTE POST
export interface createQuotePostReq extends createPostReq {
    quoted_post_id: string;
}
export interface updateQuotePostReq extends Omit<updatePostReq, "deleteKeys" | "noUpdateKeys"> { }



