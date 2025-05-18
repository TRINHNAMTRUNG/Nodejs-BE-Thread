

import { NextFunction, Request, Response } from 'express';
import * as pollVoteService from './pollVoteService';
import { responseFomat } from '../../utils/responseFomat';
import { PollVoteDTO } from './pollVoteResponse.dto';
import { plainToInstance } from 'class-transformer';
import { VotePollOptionRequestDTO } from '../posts/postRequest.dto';
import { EventTypes } from '../../constants/eventTypes';
import { PostPublisher } from '../../events/publishers/post.publisher';
import { VotePollPayloadDTO } from '../posts/postResponse.dto';
import { UserInfo } from '../../interfaces';

export const getUsersVotedPollOptionCtrl = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { post_id, poll_option_id } = req.params;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        const users = await pollVoteService.getUsersVotedPollOption(post_id, poll_option_id, page, limit);
        return responseFomat(res, users, "Get users voted poll option successfully");
    } catch (error) {
        next(error);
    }
};

export const voteAPollOptionCtrl = async (req: Request<{ id: string }, {}, VotePollOptionRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userInfo = req.user as UserInfo;
        const voteData = req.body;
        const result = await pollVoteService.voteAPollOption(id, voteData, userInfo);

        // publish to kafka

        const postMessageDto = plainToInstance(VotePollPayloadDTO, result, { excludeExtraneousValues: true });
        const publisher = new PostPublisher(EventTypes.POST_POLL_VOTED, userInfo);
        publisher.publish(postMessageDto);

        const voteDto = plainToInstance(PollVoteDTO, result.dataPollVote, { excludeExtraneousValues: true });
        return responseFomat(res, voteDto, "Voted successfully");
    } catch (error: any) {
        next(error);
    }
}

