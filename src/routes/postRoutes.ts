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
    VoteAPost
} from "../domains/posts/postRequest.dto";
import multer from "multer";
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
//Post routes
// Create Normal - Poll - Quote Post
router.post("/normals",
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
router.patch("/normals/:id",
    upload.array("files"),
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(UpdatePostRequestDTO),
    postController.updatePostCtrl
);
router.patch("/polls/:id",
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(UpdateQuoteAndPollPostRequestDTO),
    postController.updatePollCtrl
);
router.patch("/quotes/:id",
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(UpdateQuoteAndPollPostRequestDTO),
    postController.updateQuotePostCtrl
);
// Delete Post
router.delete("/:id",
    validateParamDto(IdQueryRequestDTO),
    postController.deletePostCtrl
);
// Vote Post or Unvote Post
router.post("/:id/votes",
    validateParamDto(IdQueryRequestDTO),
    validateBodyDto(VoteAPost),
    voteController.voteAPostCtrl
);
// Unvote Post
// router.delete("/:id/votes",
//     validateParamDto(IdQueryRequestDTO),
//     validateBodyDto(VoteAPost),
//     voteController.voteAPostCtrl
// );

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
