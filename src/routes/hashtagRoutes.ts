import express from "express";
import * as hashtagController from "../domains/hashtags/hashtagController";
import { validateParamDto } from "../middlewares/validation"
import { PaginationQueryRequestDTO } from "../domains/posts/postRequest.dto";

const router = express.Router();

router.get("/", validateParamDto(PaginationQueryRequestDTO), hashtagController.recommendHashtag);

export default router;
