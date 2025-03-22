import express from "express";
import * as hashtagController from "../domains/hashtag/hashtagController";
import { validateQueryParams } from "../middlewares/validation"
import { recommendHashtagSchema } from "../domains/hashtag/hashtagValidation";
const router = express.Router();

router.get("/", validateQueryParams(recommendHashtagSchema), hashtagController.recommendHashtag);

export default router;
