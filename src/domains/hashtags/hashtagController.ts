import { Request, Response } from "express";
import { handleError, responseFomat } from "../../utils/responseFomat";
import * as hashtagService from "./hashtagService";
import { queryHashtagReq } from "../../interfaces/index";
import { plainToInstance } from "class-transformer";
import { HashtagRes } from "./hashtagDTO";
import { ErrorCode } from "../../constants/errorCodes";

export const recommendHashtag = async (req: Request<{}, any, any, queryHashtagReq>, res: Response) => {
    try {
        const { limit, query } = req.query;
        const hashtags = await hashtagService.getTrendingHashtags(Number(limit), query);

        const hashtagsDto = plainToInstance(HashtagRes, hashtags, { excludeExtraneousValues: true });

        return responseFomat(res, hashtagsDto, "Hashtag recommend successfully");
    } catch (error: any) {
        handleError(error, res, "Error voting poll option", ErrorCode.INTERNAL_SERVER_ERROR);
    }
}