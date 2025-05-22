import express, { NextFunction, Request, Response } from "express";
import * as postController from "../domains/posts/postController";
import * as voteController from "../domains/votes/voteController";
import * as pollVoteController from "../domains/pollVotes/pollVotecController";
import { validateBodyDto, validateParamDto, validateQueryDto } from "../middlewares/validation";
import {
    CreatePostRequestDTO,
    CreateQuotePostRequestDTO,
    CreatePollRequestDTO,
    UpdatePostRequestDTO,
    IdQueryRequestDTO,
    UpdateQuoteAndPollPostRequestDTO,
    VotePollOptionRequestDTO,
    VoteAPost,
    PaginationQueryRequestDTO,
    IdQueryUserVotedRequestDTO
} from "../domains/posts/postRequest.dto";
import multer from "multer";
import { requireUser } from "../middlewares/requireUser";
const router = express.Router();

const upload = multer();
// // Middleware kiểm tra Content-Type
// const checkContentType = (req: Request, res: Response, next: NextFunction) => {
//     const contentType = req.headers['content-type'] || '';
//     if (contentType.includes('multipart/form-data')) {
//         return upload.array("files")(req, res, next);
//     }
//     return next(); // Bỏ qua multer nếu không phải multipart/form-data
// };

// --- POST ROUTES ---
// 
// Create Normal - Poll - Quote Post
router.post("/normals",
    requireUser,
    upload.array("files"),
    validateBodyDto(CreatePostRequestDTO),
    postController.createPostCtrl
);
router.post("/polls",
    requireUser,
    validateBodyDto(CreatePollRequestDTO),
    postController.createPollCtrl
);
router.post("/quotes",
    requireUser,
    validateBodyDto(CreateQuotePostRequestDTO),
    postController.createQuotePostCtrl
);

// Update Normal - Poll - Quote Post
router.patch("/normals/:id",
    requireUser,
    upload.array("files"),
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(UpdatePostRequestDTO),
    postController.updatePostCtrl
);
router.patch("/polls/:id",
    requireUser,
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(UpdateQuoteAndPollPostRequestDTO),
    postController.updatePollCtrl
);
router.patch("/quotes/:id",
    requireUser,
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(UpdateQuoteAndPollPostRequestDTO),
    postController.updateQuotePostCtrl
);

// Delete Post
router.delete("/:id",
    requireUser,
    validateParamDto(IdQueryRequestDTO),
    postController.deletePostCtrl
);

// --- VOTE ROUTES ---

// Vote Post or Unvote Post
router.post("/:id/votes",
    requireUser,
    validateParamDto(IdQueryRequestDTO),
    voteController.voteLikeAPostCtrl
);

// Vote A Poll Option
router.post("/:id/polls/votes",
    requireUser,
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(VotePollOptionRequestDTO),
    pollVoteController.voteAPollOptionCtrl
)

// --- GET ROUTES ---

// Get posts quoted by user
router.get("/quoted", requireUser, postController.getQuotedPosts);

// Get posts commented by user
router.get("/commented", requireUser, postController.getCommentedPosts);

// Get posts liked by user
router.get("/liked", requireUser, postController.getLikedPosts);

// Get post by keyword
router.get("/search", validateQueryDto(PaginationQueryRequestDTO), postController.searchPostsCtrl);

// Get post by hashtag
router.get("/hashtags/:hashtag", validateQueryDto(PaginationQueryRequestDTO), postController.getPostsByHashtagCtrl);

// Get post by id user
router.get("/user/:id",
    validateParamDto(IdQueryRequestDTO),
    validateQueryDto(PaginationQueryRequestDTO),
    postController.getPostByIdUserCtrl
);

// Xem danh sách user đã vote cho 1 poll option
router.get(
    "/:post_id/polls/:poll_option_id/votes",
    validateParamDto(IdQueryUserVotedRequestDTO),
    pollVoteController.getUsersVotedPollOptionCtrl
);

// Get post by id post
router.get("/:id",
    validateParamDto(IdQueryRequestDTO),
    postController.getPostByIdCtrl
);

router.get("/", postController.getAllPostsCtrl);

// Get user like post by post_id(target_id)
router.get("/liked/:id",
    requireUser,
    validateParamDto(IdQueryRequestDTO),
    voteController.getUserLikedPostCtrl)

export default router;
