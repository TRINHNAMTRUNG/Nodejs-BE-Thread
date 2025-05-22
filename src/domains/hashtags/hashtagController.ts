import { NextFunction, Request, Response } from "express";
import { responseFomat } from "../../utils/responseFomat";
import * as hashtagService from "./hashtagService";
import { queryHashtagReq } from "../../interfaces/index";
import { plainToInstance } from "class-transformer";
import { HashtagRes } from "./hashtagResponse.dto";


export const recommendHashtag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.query?.toString() || "";
        const hashtags = await hashtagService.getTrendingHashtags(5, query); // Giới hạn cố định 5

        const hashtagsDto = plainToInstance(HashtagRes, hashtags, {
            excludeExtraneousValues: true
        });

        return responseFomat(res, hashtagsDto, "Hashtag recommend successfully");
    } catch (error: any) {
        next(error);
    }
};