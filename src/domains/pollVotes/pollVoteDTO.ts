

import { Expose, Transform } from "class-transformer";
import { Schema } from "mongoose";

export class PollVoteDTO {
    @Expose()
    @Transform(params => params.obj.poll_option_id)
    poll_option_id!: Schema.Types.ObjectId;

    @Expose()
    @Transform(params => params.obj.user_id)
    user_id!: Schema.Types.ObjectId;

    @Expose()
    @Transform(params => params.obj.post_id)
    post_id!: Schema.Types.ObjectId;

    @Expose()
    created_at!: Date;
}
