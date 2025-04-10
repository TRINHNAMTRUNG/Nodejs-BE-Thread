import { number } from "joi";
import mongoose, { Schema, model } from "mongoose";

const hashtagSchema = new Schema(
    {
        name: { type: String, required: true },
        post_count: { type: Number, default: 0 }
    }, { timestamps: true, collection: "hashtags" }
);

hashtagSchema.index({ name: 1, post_count: -1 }); // Gợi ý hashtag theo prefix - thịnh hành


const HashtagModel = model("Hashtag", hashtagSchema);

export default HashtagModel;