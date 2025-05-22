import { isCancel } from "axios";

export interface UserInfo {
    _id: string;
    fullname: string;
    avatar: string;
    isActive: boolean;
}