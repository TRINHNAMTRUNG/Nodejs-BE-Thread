
import { Expose, Transform } from "class-transformer";
import { Schema } from "mongoose";

export class LikePostDTO {
    @Expose()
    @Transform(params => params.obj.post_Id)
    post_Id!: Schema.Types.ObjectId;

    @Expose()
    @Transform(params => params.obj.user_id)
    user_id!: Schema.Types.ObjectId;

    @Expose()
    created_at!: Date;
}

