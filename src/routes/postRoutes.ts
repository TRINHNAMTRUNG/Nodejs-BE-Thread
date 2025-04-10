import express from "express";
import * as postController from "../domains/posts/postController";
import * as voteController from "../domains/votes/voteController";
import * as pollVoteController from "../domains/pollVotes/pollVotecController";
import { validateBodyDto, validateParamDto, validateQueryDto } from "../middlewares/validation";
import { generalUpdatePostSchema, generalCreatePostSchema, idQuerySchema, votePollOptionSchema } from "../domains/posts/postValidation";
import { votePostSchema } from "../domains/votes/voteValidation";
import {
    CreatePostRequestDTO,
    CreateQuotePostRequestDTO,
    CreatePollRequestDTO,
    UpdatePostRequestDTO,
    IdQueryRequestDTO,
    UpdateQuoteAndPollPostRequestDTO,
    VotePollOptionRequestDTO,
    VoteAPost
} from "../domains/posts/postRequest.dto";
import multer from "multer";
const router = express.Router();

const upload = multer();

//Post routes
// Create Normal - Poll - Quote Post
router.post("/normal",
    upload.array("files"),
    validateBodyDto(CreatePostRequestDTO),
    postController.createPostCtrl
);
router.post("/polls",
    validateBodyDto(CreatePollRequestDTO),
    postController.createPollCtrl
);
router.post("/quotes",
    validateBodyDto(CreateQuotePostRequestDTO),
    postController.createQuotePostCtrl
);
// Update Normal - Poll - Quote Post
router.patch("normal/:id",
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(UpdatePostRequestDTO),
    postController.updatePostCtrl
);
router.patch("polls/:id",
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(UpdateQuoteAndPollPostRequestDTO),
    postController.updatePollCtrl
);
router.patch("quotes/:id",
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(UpdateQuoteAndPollPostRequestDTO),
    postController.updateQuotePostCtrl
);
// Delete Post
router.delete("/:id",
    validateParamDto(IdQueryRequestDTO),
    postController.deletePostCtrl
);
// Vote Post
router.post("/:id/votes",
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(VoteAPost),
    voteController.voteAPostCtrl
);
// Unvote Post
router.delete("/:id/votes",
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(VoteAPost),
    voteController.voteAPostCtrl
);
// Vote A Poll Option
router.post("/:id/polls/votes",
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(VotePollOptionRequestDTO),
    pollVoteController.voteAPollOptionCtrl
)
// router.post("/comment/:id", postController.commentPostCtrl);

router.get("/:id", postController.getPostByIdUserCtrl);
router.get("/", postController.getAllPostsCtrl);

export default router;
