import express from "express";
import { validateBodyDto, validateQueryDto, validateParamDto } from "../middlewares/validation";
import { CreateCommentRequestDTO, IdParentCommentQueryRequestDTO, IdPostQueryRequestDTO } from "../domains/comments/commentRequest.dto";
import * as commentController from "../domains/comments/commentController";
import { PaginationQueryRequestDTO, IdQueryRequestDTO } from "../domains/posts/postRequest.dto";

const router = express.Router();

// Create a new comment
router.post(
    "/",
    validateBodyDto(CreateCommentRequestDTO),
    commentController.createComment
);

//comments/:post_id
router.get(
    "/:post_id",
    validateParamDto(IdPostQueryRequestDTO),
    validateQueryDto(PaginationQueryRequestDTO), // Validate page và limit
    commentController.getPreviewComments
);

///replies/:post_id/:parent_comment_id?page=1&limit=5
router.get(
    "/replies/:post_id/:parent_comment_id",
    validateParamDto(IdPostQueryRequestDTO), // Validate post_id
    validateParamDto(IdParentCommentQueryRequestDTO), // Validate parent_comment_id
    validateQueryDto(PaginationQueryRequestDTO), // Validate page và limit
    commentController.getMoreCommentReplies
);

export default router;