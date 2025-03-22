import express from "express";
import * as postController from "../domains/post/postController";
import { validate } from "../middlewares/validation";
import { createPostSchema, updatePostSchema, creaetPollSchema } from "../domains/post/postValidation";
import multer from "multer";
const router = express.Router();

const upload = multer();

router.post("/", upload.array("files"), validate(createPostSchema), postController.createPostCtrl);
router.post("/poll", validate(creaetPollSchema), postController.createPollCtrl);
router.patch("/post:id", validate(updatePostSchema), postController.updatePostCtrl);
router.delete("/:id", postController.deletePostCtrl);
router.get("/:id", postController.getPostByIdUserCtrl);
router.get("/", postController.getAllPostsCtrl);

export default router;
