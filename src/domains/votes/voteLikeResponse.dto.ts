
import { Expose, Transform, Type } from "class-transformer";
import { Schema } from "mongoose";
import { Target_type, VoteType } from "../../constants/voteEnum";



class UserInfo {
    @Expose()
    @Transform(params => params.obj.id)
    id!: Schema.Types.ObjectId;

    @Expose()
    fullname!: string;

    @Expose()
    avatar!: string;
}

export class VoteDTO {

    @Expose()
    @Transform(params => params.obj._id)
    _id!: Schema.Types.ObjectId;

    @Expose()
    @Transform(params => params.obj.target_id)
    target_id!: Schema.Types.ObjectId;

    @Expose()
    target_type!: Target_type;

    @Expose()
    @Transform(params => params.obj.user_id)
    user_id!: Schema.Types.ObjectId;

    @Expose()
    createdAt!: Date;
}

export class VoteResponseDTO extends VoteDTO {
    @Expose()
    vote_type!: VoteType;
}

export class VotePayloadDTO extends VoteDTO { }



