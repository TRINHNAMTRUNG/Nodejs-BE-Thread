import { handleError } from "../../utils/responseFomat"
import { Request, Response } from "express";
import { responseFomat } from "../../utils/responseFomat"
import { voteAPostService } from "./voteService";
import { ErrorCode } from "../../constants/errorCodes";
export const voteAPostCtrl = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        const statusVote = await voteAPostService(id, user_id);
        return responseFomat(res, statusVote, "Post voted successfully");
    } catch (error: any) {
        handleError(error, res, "Error voting post", ErrorCode.INTERNAL_SERVER_ERROR);
    }
}