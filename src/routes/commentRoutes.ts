import express from "express";
import {
    validateBodyDto,
    validateQueryDto,
    validateParamDto
} from "../middlewares/validation";
import {
    CreateCommentRequestDTO,
    IdParentCommentQueryRequestDTO,
    IdPostQueryRequestDTO,
    updateCommentRequestDTO
} from "../domains/comments/commentRequest.dto";
import * as commentController from "../domains/comments/commentController";
import {
    PaginationQueryRequestDTO,
    IdQueryRequestDTO
} from "../domains/posts/postRequest.dto";
import { requireUser } from "../middlewares/requireUser";
import * as voteController from "../domains/votes/voteController";

const router = express.Router();

// -------------------- COMMENT --------------------

// Create a new comment
router.post(
    "/",
    requireUser,
    validateBodyDto(CreateCommentRequestDTO),
    commentController.createComment
);

// Update comment
router.patch(
    "/:id",
    requireUser,
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(updateCommentRequestDTO),
    commentController.updateComment
);

// Delete comment
router.delete(
    "/:id",
    requireUser,
    validateParamDto(IdQueryRequestDTO),
    commentController.deleteComment
);

// -------------------- VOTES --------------------

// Vote or unvote a comment
router.post(
    "/:id/votes",
    requireUser,
    validateParamDto(IdQueryRequestDTO),
    voteController.voteLikeACommentCtrl
);

// -------------------- EDIT HISTORY --------------------

// Get edit histories of a comment
router.get(
    "/comments/:comment_id/edit-histories",
    commentController.getEditHistoriesByCommentId
);

// -------------------- REPLIES --------------------

// Get more replies of a comment
// /replies/:post_id/:parent_comment_id?page=1&limit=5
router.get(
    "/replies/:post_id/:parent_comment_id",
    validateParamDto(IdPostQueryRequestDTO),
    validateParamDto(IdParentCommentQueryRequestDTO),
    validateQueryDto(PaginationQueryRequestDTO),
    commentController.getMoreCommentReplies
);

// -------------------- COMMENT PREVIEW --------------------

// Get preview comments of a post
router.get(
    "/:post_id",
    validateParamDto(IdPostQueryRequestDTO),
    validateQueryDto(PaginationQueryRequestDTO),
    commentController.getPreviewComments
);

export default router;
