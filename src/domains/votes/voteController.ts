
import { NextFunction, Request, Response } from "express";
import { responseFomat } from "../../utils/responseFomat"
import { voteAPostService } from "./voteService";
export const voteAPostCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        const statusVote = await voteAPostService(id, user_id);
        return responseFomat(res, statusVote, "Post voted successfully");
    } catch (error: any) {
        next(error);
    }
}