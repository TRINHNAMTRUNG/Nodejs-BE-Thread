import express from "express";
import postRoutes from "./postRoutes";
const router = express.Router();

router.use("/posts", postRoutes);
router.use("/hashtags", postRoutes);


export default router;