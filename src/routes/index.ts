import express from "express";
import postRoutes from "./postRoutes";
import hashtagRoutes from "./hashtagRoutes";
import commentRoutes from "./commentRoutes";
const router = express.Router();

router.use("/posts", postRoutes);
router.use("/hashtags", hashtagRoutes);
router.use("/comments", commentRoutes);


export default router;