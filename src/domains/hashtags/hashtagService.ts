
import HashtagModel from "./hashtagModel";

export const findOrCreateHashtags = async (hashtagNames: string[]) => {
    if (hashtagNames.length == 0) return;
    const bulkOps = hashtagNames.map(name => {
        return {
            updateOne: {
                filter: { name },
                update: { $inc: { post_count: 1 } },
                upsert: true
            }
        }
    });

    await HashtagModel.bulkWrite(bulkOps);
}

export const getTrendingHashtags = async (limit: number = 5, query: string) => {
    let filter = {};
    if (query) {
        filter = { name: { $regex: query, $options: "i" } }; // Tìm kiếm không phân biệt hoa thường
    }
    return await HashtagModel.find(filter)
        .sort({ count_post: -1 })  // Sắp xếp giảm dần theo count_post
        .limit(limit)
        .select({ name: 1, post_count: 1 })
        .lean();
}