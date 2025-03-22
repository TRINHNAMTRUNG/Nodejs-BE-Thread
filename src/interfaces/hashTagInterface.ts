
import { ParsedQs } from "qs";
export interface queryHashtagReq extends ParsedQs {
    limit: string;
    query: string;
}