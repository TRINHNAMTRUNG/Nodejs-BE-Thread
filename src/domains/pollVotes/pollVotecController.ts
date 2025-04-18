

import { Request, Response } from 'express';
import * as pollVoteService from './pollVoteService';
import { AppError, responseFomat, handleError } from '../../utils/responseFomat';
import { PollVoteDTO } from './pollVoteDTO';
import { plainToInstance } from 'class-transformer';
import { voteAPollOptionReq } from '../../interfaces';
import { ErrorCode } from "../../constants/errorCodes";
import { VotePollOptionRequestDTO } from '../posts/postRequest.dto';

export const voteAPollOptionCtrl = async (req: Request<{ id: string }, {}, VotePollOptionRequestDTO>, res: Response) => {
    try {
        const { id } = req.params;
        const voteData = req.body;
        const vote = await pollVoteService.voteAPollOption(id, voteData);
        const voteDto = plainToInstance(PollVoteDTO, vote, { excludeExtraneousValues: true });
        return responseFomat(res, voteDto, "Voted successfully");
    } catch (error: any) {
        handleError(error, res, "Error voting poll option", ErrorCode.INTERNAL_SERVER_ERROR);
    }
}

