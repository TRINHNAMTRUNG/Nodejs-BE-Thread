import { Expose } from "class-transformer";
import { IsMongoId, IsOptional, IsString, Length, MinLength } from "class-validator";

export class CreateCommentRequestDTO {
    @Expose()
    @IsMongoId()
    post_id!: string;

    @Expose()
    @IsString()
    @MinLength(1, { message: 'Comment must not be empty' })
    content!: string;

    @Expose()
    @IsOptional()
    @IsMongoId()
    parent_comment_id!: string;

    @Expose()
    @IsOptional()
    @IsMongoId()
    reply_to_user_id?: string;
}

export class updateCommentRequestDTO {

    @Expose()
    @IsString()
    @MinLength(1, { message: 'Comment must not be empty' })
    content!: string;

}


// Request DTO cho Query
export class IdParentCommentQueryRequestDTO {
    @Expose()
    @IsMongoId()
    parent_comment_id!: string;
}
export class IdPostQueryRequestDTO {
    @Expose()
    @IsMongoId()
    post_id!: string;
}