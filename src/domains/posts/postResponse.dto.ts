import { Expose, Transform, Type } from 'class-transformer';
import { Schema } from 'mongoose';

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
    url!: string;
}

export class PostResponseDTO {
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
    save_post_count!: number;

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

export class PollResponseDTO extends PostResponseDTO {
    @Expose()
    @Type(() => Poll)
    poll!: Poll;
}

export class QuotePostResponseDTO extends PostResponseDTO {
    @Expose()
    @Transform(params => params.obj.quoted_post_id)
    quoted_post_id!: Schema.Types.ObjectId;
}