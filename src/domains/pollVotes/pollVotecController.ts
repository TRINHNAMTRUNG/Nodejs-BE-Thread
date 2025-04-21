

import { NextFunction, Request, Response } from 'express';
import * as pollVoteService from './pollVoteService';
import { responseFomat } from '../../utils/responseFomat';
import { PollVoteDTO } from './pollVoteResponse.dto';
import { plainToInstance } from 'class-transformer';
import { VotePollOptionRequestDTO } from '../posts/postRequest.dto';

export const voteAPollOptionCtrl = async (req: Request<{ id: string }, {}, VotePollOptionRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const voteData = req.body;
        const vote = await pollVoteService.voteAPollOption(id, voteData);
        const voteDto = plainToInstance(PollVoteDTO, vote, { excludeExtraneousValues: true });
        return responseFomat(res, voteDto, "Voted successfully");
    } catch (error: any) {
        next(error);
    }
}

