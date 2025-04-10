import { Expose, Type } from 'class-transformer';
import {
    IsString,
    MinLength,
    IsEnum,
    IsArray,
    ValidateNested,
    IsOptional,
    Length,
    IsInt,
    Min,
    Max,
    IsDateString,
    ArrayMinSize,
    ArrayMaxSize,
} from 'class-validator';
import { Schema } from 'mongoose';

// Enum cho visibility và status_poll
enum Visibility {
    PUBLIC = 'public',
    FRIENDS = 'friends',
    PRIVATE = 'private',
}

enum StatusPoll {
    CLOSED = 'Closed',
    OPENING = 'Opening',
}

// Class con cho request
class UserTagRequest {
    @Expose()
    @IsString()
    @Length(24, 24, { message: 'user_tags id must be exactly 24 characters' })
    id!: string; // ObjectId dạng string, 24 ký tự hex

    @Expose()
    @IsString()
    @MinLength(1, { message: 'user_tags name must have at least 1 character' })
    name!: string;
}

class PollOptionRequest {
    @Expose()
    @IsString()
    @MinLength(1, { message: 'poll_options content is required' })
    content!: string;
}

class PollRequest {
    @Expose()
    @IsDateString({}, { message: 'end_at must be a valid ISO date string' })
    end_at!: string; // ISO date string từ client

    @Expose()
    @IsEnum(StatusPoll, { message: "status_poll must be 'Closed' or 'Opening'" })
    status_poll!: string;

    @Expose()
    @IsArray()
    @ArrayMinSize(2, { message: 'At least 2 options are required in the poll' })
    @ArrayMaxSize(4, { message: 'Only allow maximum 4 options in the poll' })
    @ValidateNested({ each: true })
    @Type(() => PollOptionRequest)
    poll_options!: PollOptionRequest[];
}

class UrlsRequest {
    @Expose()
    @IsString()
    key!: string;

    @Expose()
    @IsString()
    url!: string;
}

// Request DTO cho Post
export class CreatePostRequestDTO {
    @Expose()
    @IsString()
    @Length(24, 24, { message: 'creator_id must be exactly 24 characters' })
    creator_id!: string;

    @Expose()
    @IsString()
    @MinLength(1, { message: 'Post content must have at least 1 character' })
    content!: string;

    @Expose()
    @IsEnum(Visibility, { message: "visibility must be 'public', 'private', or 'friends'" })
    visibility!: Visibility;

    @Expose()
    @IsArray()
    @ArrayMinSize(1, { message: 'user_tags must contain at least one tag' })
    @ValidateNested({ each: true })
    @Type(() => UserTagRequest)
    @IsOptional()
    user_tags?: UserTagRequest[];

    @Expose()
    @IsArray()
    @ArrayMinSize(1, { message: 'Hashtags must contain at least one tag' })
    @IsString({ each: true, message: 'Each hashtag must be a string' })
    @IsOptional()
    hashtags?: string[];
}

// Request DTO cho Poll
export class CreatePollRequestDTO extends CreatePostRequestDTO {
    @Expose()
    @ValidateNested()
    @Type(() => PollRequest)
    poll!: PollRequest;
}

// Request DTO cho Quote Post
export class CreateQuotePostRequestDTO extends CreatePostRequestDTO {
    @Expose()
    @IsString()
    @Length(24, 24, { message: 'quoted_post_id must be exactly 24 characters' })
    quoted_post_id!: string;
}

// Request DTO cho Update Post
export class UpdatePostRequestDTO {
    @Expose()
    @IsString()
    @MinLength(3, { message: 'Post content must have at least 3 characters' })
    @IsOptional()
    content?: string;

    @Expose()
    @IsEnum(Visibility, { message: "visibility must be 'public', 'private', or 'friends'" })
    @IsOptional()
    visibility?: Visibility;

    @Expose()
    @IsArray()
    @ArrayMinSize(1, { message: 'user_tags must contain at least one tag' })
    @ValidateNested({ each: true })
    @Type(() => UserTagRequest)
    @IsOptional()
    user_tags?: UserTagRequest[];

    @Expose()
    @IsArray()
    @ArrayMinSize(1, { message: 'Hashtags must contain at least one tag' })
    @IsString({ each: true, message: 'Each hashtag must be a string' })
    @IsOptional()
    hashtags?: string[];

    @Expose()
    @IsArray()
    @ArrayMinSize(1, { message: 'noUpdateKeys must contain at least one tag' })
    @IsString({ each: true, message: 'Each noUpdateKeys must be a string' })
    @IsOptional()
    noUpdateKeys?: string[];

    @Expose()
    @IsArray()
    @ArrayMinSize(1, { message: 'deleteKeys must contain at least one tag' })
    @IsString({ each: true, message: 'Each deleteKeys must be a string' })
    @IsOptional()
    deleteKeys?: string[];
}
// Request DTO cho Update Post
export class UpdateQuoteAndPollPostRequestDTO {
    @Expose()
    @IsString()
    @MinLength(3, { message: 'Post content must have at least 3 characters' })
    @IsOptional()
    content?: string;

    @Expose()
    @IsEnum(Visibility, { message: "visibility must be 'public', 'private', or 'friends'" })
    @IsOptional()
    visibility?: Visibility;

    @Expose()
    @IsArray()
    @ArrayMinSize(1, { message: 'user_tags must contain at least one tag' })
    @ValidateNested({ each: true })
    @Type(() => UserTagRequest)
    @IsOptional()
    user_tags?: UserTagRequest[];

    @Expose()
    @IsArray()
    @ArrayMinSize(1, { message: 'Hashtags must contain at least one tag' })
    @IsString({ each: true, message: 'Each hashtag must be a string' })
    @IsOptional()
    hashtags?: string[];
}

// Request DTO cho Vote Poll Option
export class VotePollOptionRequestDTO {
    @Expose()
    @IsString()
    @Length(24, 24, { message: 'poll_option_id must be exactly 24 characters' })
    poll_option_id!: string;

    @Expose()
    @IsString()
    @Length(24, 24, { message: 'post_id must be exactly 24 characters' })
    post_id!: string;

    @Expose()
    @IsString()
    @Length(24, 24, { message: 'user_id must be exactly 24 characters' })
    user_id!: string;
}

// Request DTO cho Query
export class IdQueryRequestDTO {
    @Expose()
    @IsString()
    @Length(24, 24, { message: 'id must be exactly 24 characters' })
    id!: string;
}

export class PaginationQueryRequestDTO {
    @Expose()
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page cannot be less than 1' })
    @IsOptional()
    page?: number = 1;

    @Expose()
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit cannot be less than 1' })
    @Max(100, { message: 'Limit cannot exceed 100' })
    @IsOptional()
    limit?: number = 10;
}

//Vote like a post
export class VoteAPost {
    @Expose()
    @IsString()
    @Length(24, 24, { message: 'user_id must be exactly 24 characters' })
    user_id!: string
}