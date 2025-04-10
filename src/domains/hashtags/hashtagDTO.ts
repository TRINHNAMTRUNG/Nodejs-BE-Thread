

import { Expose } from "class-transformer";

export class HashtagRes {
    @Expose()
    name!: string;

    @Expose()
    post_count!: number;
}