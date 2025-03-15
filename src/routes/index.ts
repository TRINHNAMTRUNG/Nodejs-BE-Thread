import express from "express";
import postRoutes from "./postRoutes";
import hashtagRoutes from "./hashtagRoutes";
const router = express.Router();

router.use("/post", postRoutes);
router.use("/hashtag", postRoutes);


export default router;