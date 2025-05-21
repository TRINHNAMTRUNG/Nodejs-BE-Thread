import { Expose, Transform, Type } from "class-transformer";
import { Schema } from "mongoose";
import { PollVoteDTO } from "../pollVotes/pollVoteResponse.dto";
class UserTag {
    @Expose()
    @Transform(params => params.obj.id)
    id!: Schema.Types.ObjectId;

    @Expose()
    name!: string;
}

class PollOption {
    @Expose()
    content!: string;

    @Expose()
    vote_count!: number;

    @Expose()
    voters!: Schema.Types.ObjectId[];

    @Expose()
    @Transform(params => params.obj._id)
    _id!: string
}

class Poll {
    @Expose()
    end_at!: Date;

    @Expose()
    status_poll!: string;

    @Expose()
    @Type(() => PollOption)
    poll_options!: PollOption[];
}

class Urls {
    @Expose()
    key!: string;
    @Expose()
    url!: string
}

//RESPONSES POST
export class PostDTO {
    @Expose()
    type!: string;

    @Expose()
    @Transform(params => params.obj._id)
    _id!: Schema.Types.ObjectId;

    @Expose()
    @Transform(params => params.obj.creator_id)
    creator_id!: Schema.Types.ObjectId;

    @Expose()
    content!: string;

    @Expose()
    visibility!: string;

    @Expose()
    like_count!: number;

    @Expose()
    comment_count!: number;

    @Expose()
    qoute_post_count!: number;

    @Expose()
    @Transform(({ value }) => value ?? [])
    urls!: Urls[];

    @Expose()
    @Type(() => UserTag)
    @Transform(({ value }) => value ?? [])
    user_tags!: UserTag[];

    @Expose()
    @Transform(({ value }) => value ?? [])
    hashtags!: string[];

    @Expose()
    createdAt!: Date;
}
//RESPONSES POLL
export class PollDTO extends PostDTO {
    @Expose()
    @Type(() => Poll)
    poll!: Poll;
}
//RESPONSES QUOTE POST
export class QuotePostDTO extends PostDTO {
    @Expose()
    @Transform(params => params.obj.quoted_post_id)
    quoted_post_id!: Schema.Types.ObjectId;
}

//PAYLOADS POST KAFKA

export class PostPayloadDTO extends PostDTO {
    @Expose()
    @Type(() => Poll)
    poll?: Poll;

    @Expose()
    @Transform(params => params.obj.quoted_post_id)
    quoted_post_id?: Schema.Types.ObjectId;

    @Expose()
    hashtagUpdate!: { name: string, type: string, id?: string }[];
}


export class VotePollPayloadDTO {
    @Expose()
    @Transform(params => params.obj._id)
    _id!: Schema.Types.ObjectId;

    @Expose()
    @Type(() => Poll)
    poll!: Poll;

    @Expose()
    @Type(() => PollVoteDTO)
    dataPollVote!: PollVoteDTO
}

export class DeletePostPayloadDTO {
    @Expose()
    @Transform(params => params.obj._id)
    _id!: Schema.Types.ObjectId;

    @Expose()
    hashtagUpdate!: { name: string, type: string, id?: string }[];
}