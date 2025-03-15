import { Request, Response } from "express";
import { responseFomat } from "../../utils/responseFomat";
import * as hashtagService from "./hashtagService";
import { queryHashTagReq } from "../../interfaces/index";
import { plainToInstance } from "class-transformer"
import { HashtagRes } from "./hashtagDTO";

export const recommendHashtag = async (req: Request<{}, {}, {}, queryHashTagReq>, res: Response) => {
    try {
        const { limit, query } = req.query;
        const hashtags = await hashtagService.getTrendingHashtags(limit, query);

        const hashtagsDto = plainToInstance(HashtagRes, hashtags, { excludeExtraneousValues: true });

        return responseFomat(res, hashtagsDto, "Hashtag recommend successfully");
    } catch (error: any) {
        return responseFomat(
            res,
            null,
            "Error recommend hashtag",
            false,
            500,
            error.message || "Unknown error"
        );
    }
}