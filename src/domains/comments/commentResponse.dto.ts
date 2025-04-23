import { Expose, Transform, Type } from "class-transformer";

export class CommentResDTO {
    @Expose()
    @Transform(params => params.obj._id)
    _id!: string;

    @Expose()
    @Transform(params => params.obj.post_id)
    post_id!: string;

    @Expose()
    @Transform(params => params.obj.user_id)
    user_id!: string;

    @Expose()
    @Transform(params => params.obj.content)
    content!: string;

    @Expose()
    level!: number;

    @Expose()
    @Transform(params => params.obj.parent_comment_id)
    parent_comment_id?: string;

    @Expose()
    @Transform(params => params.obj.reply_to_user_id)
    reply_to_user_id?: string;

    @Expose()
    like_count!: number;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;
}

export class CommentWithPreviewDTO extends CommentResDTO {
    @Expose()
    @Type(() => CommentResDTO)
    previewReply?: CommentResDTO;
}