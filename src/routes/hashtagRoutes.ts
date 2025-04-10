import express from "express";
import * as hashtagController from "../domains/hashtags/hashtagController";
import { validateQueryParams } from "../middlewares/validation"
import { recommendHashtagSchema } from "../domains/hashtags/hashtagValidation";
const router = express.Router();

router.get("/", validateQueryParams(recommendHashtagSchema), hashtagController.recommendHashtag);

export default router;
