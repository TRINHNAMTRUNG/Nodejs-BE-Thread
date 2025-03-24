import express from "express";
import * as postController from "../domains/post/postController";
import { validateBody } from "../middlewares/validation";
import { createPostSchema, updatePostSchema, createPollSchema } from "../domains/post/postValidation";
import multer from "multer";
const router = express.Router();

const upload = multer();

router.post("/", upload.array("files"), validateBody(createPostSchema, { allowUnknown: false }), postController.createPostCtrl);
router.post("/poll", validateBody(createPollSchema), postController.createPollCtrl);
router.patch("/update-post/:id", validateBody(updatePostSchema), postController.updatePostCtrl);
router.delete("/:id", postController.deletePostCtrl);
router.get("/:id", postController.getPostByIdUserCtrl);
router.get("/", postController.getAllPostsCtrl);

export default router;
