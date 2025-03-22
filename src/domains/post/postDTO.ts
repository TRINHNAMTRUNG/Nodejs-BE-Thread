import { Expose, Type } from "class-transformer";
import { Schema } from "mongoose";

class UserTagDTO {
    @Expose()
    id!: Schema.Types.ObjectId;

    @Expose()
    name!: string;
}

class PollOptionDTO {
    @Expose()
    content!: string;

    @Expose()
    vote_count!: number;

    @Expose()
    voters!: Schema.Types.ObjectId[];
}

class PollDTO {
    @Expose()
    end_at!: Date;

    @Expose()
    status_poll!: string;

    @Expose()
    @Type(() => PollOptionDTO)
    poll_options!: PollOptionDTO[];
}

class Urls {
    @Expose()
    key!: string;
    @Expose()
    url!: string
}
export class PostDTO {
    @Expose()
    id!: Schema.Types.ObjectId;

    @Expose()
    creator_id!: Schema.Types.ObjectId;

    // @Expose()
    // reply_to?: Schema.Types.ObjectId;

    @Expose()
    content!: string;

    @Expose()
    visibility!: string;

    @Expose()
    reply_count!: number;

    @Expose()
    like_count!: number;

    @Expose()
    comment_count!: number;

    @Expose()
    save_post_count!: number;

    @Expose()
    urls?: Urls[];

    @Expose()
    @Type(() => UserTagDTO)
    user_tags?: UserTagDTO[];

    @Expose()
    hashtags?: string[];

    @Expose()
    createdAt!: Date;
}

export class CreatPollDTO extends PostDTO {
    @Expose()
    @Type(() => PollDTO)
    poll!: PollDTO;
}