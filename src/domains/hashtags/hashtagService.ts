
import HashtagModel from "./hashtagModel";

export const findOrCreateHashtags = async (newHashtagNames: string[], oldHashtagName: string[]): Promise<{ name: string, type: string, id?: string }[] | []> => {
    if (newHashtagNames.length == 0 && oldHashtagName.length == 0) return [];
    const hashtagUpdates: { name: string, type: string, id?: string }[] = [];
    newHashtagNames.forEach(hashtag => {
        if (!oldHashtagName.includes(hashtag)) {
            hashtagUpdates.push({ name: hashtag, type: "add" });
        }
    });
    oldHashtagName.forEach(hashtag => {
        if (!newHashtagNames.includes(hashtag)) {
            hashtagUpdates.push({ name: hashtag, type: "remove" });
        }
    });
    const bulkOps = hashtagUpdates.map(update => {
        return {
            updateOne: {
                filter: { name: update.name },
                update: { $inc: { post_count: update.type === "add" ? 1 : -1 } },
                upsert: true
            }
        };
    });
    const result = await HashtagModel.bulkWrite(bulkOps, { ordered: false });
    if (result && result.upsertedCount > 0) {
        const upsertedIds = result.getRawResponse().upserted;
        upsertedIds.forEach(({ index, _id }: { index: number; _id: string }) => {
            hashtagUpdates[index].id = _id.toString();
        });
    }
    return hashtagUpdates;
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