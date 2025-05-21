
import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { EventTypes } from "../../constants/eventTypes";
import { Target_type, VoteType } from "../../constants/voteEnum";
import { VotePublisher } from "../../events/publishers/vote.publisher";
import { UserInfo } from "../../interfaces/index";
import { responseFomat } from "../../utils/responseFomat";
import { VotePayloadDTO, VoteResponseDTO } from "./voteLikeResponse.dto";
import { voteActionService } from "./voteService";



export const voteLikeAPostCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userInfo = req.user as UserInfo;
        const result = await voteActionService(id, userInfo._id, Target_type.POST);

        const voteMessageDto = plainToInstance(VotePayloadDTO, result, { excludeExtraneousValues: true });
        const eventType = result.vote_type === VoteType.VOTED ? EventTypes.LIKE_VOTED : EventTypes.LIKE_UNVOTED;
        const publisher = new VotePublisher(eventType, userInfo);
        console.log("voteMessageDto", voteMessageDto);
        console.log("result controller", result);
        publisher.publish(voteMessageDto);

        const voteDto = plainToInstance(VoteResponseDTO, result, { excludeExtraneousValues: true });
        return responseFomat(res, voteDto, "Post voted successfully");
    } catch (error: any) {
        next(error);
    }
}
export const voteLikeACommentCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userInfo = req.user as UserInfo;
        const result = await voteActionService(id, userInfo._id, Target_type.COMMENT);

        const voteMessageDto = plainToInstance(VotePayloadDTO, result, { excludeExtraneousValues: true });
        const eventType = result.vote_type === VoteType.VOTED ? EventTypes.LIKE_VOTED : EventTypes.LIKE_UNVOTED;
        const publisher = new VotePublisher(eventType, userInfo);
        publisher.publish(voteMessageDto);

        const voteDto = plainToInstance(VoteResponseDTO, result, { excludeExtraneousValues: true });
        return responseFomat(res, voteDto, "Comment voted successfully");
    } catch (error: any) {
        next(error);
    }
}