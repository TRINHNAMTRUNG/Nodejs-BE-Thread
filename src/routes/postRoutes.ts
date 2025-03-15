import express from "express";
import * as postController from "../domains/post/postController";
import { validate } from "../middlewares/validation";
import { createPostSchema, updatePostSchema } from "../domains/post/postValidation";

const router = express.Router();

router.post("/", validate(createPostSchema), postController.createPostCtrl);
router.put("/:id", validate(updatePostSchema), postController.updatePostCtrl);
router.delete("/:id", postController.deletePostCtrl);
router.get("/:id", postController.getPostByIdCtrl);
router.get("/", postController.getAllPostsCtrl);

export default router;
