import { BasePublisher } from "./base.publisher";
import { TopicTypes } from "../../constants/topicTypes";
import { EventTypes } from "../../constants/eventTypes";
import { CommentPayloadDTO, DeleteCommentPayloadDTO, UpdateCommentPayloadDTO } from "../../domains/comments/commentResponse.dto";

export class CommentPublisher extends BasePublisher<CommentPayloadDTO | DeleteCommentPayloadDTO | UpdateCommentPayloadDTO> {
    readonly topicType = TopicTypes.COMMENT_EVENT;
    readonly eventType: EventTypes;
    readonly userInfo: any;
    constructor(eventType: EventTypes, userInfo: any) {
        super();
        this.eventType = eventType;
        this.userInfo = userInfo;
    }
}