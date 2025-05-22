import { BasePublisher } from "./base.publisher";
import { TopicTypes } from "../../constants/topicTypes";
import { EventTypes } from "../../constants/eventTypes";
import { VotePayloadDTO } from "../../domains/votes/voteLikeResponse.dto";

export class VotePublisher extends BasePublisher<VotePayloadDTO> {
    readonly topicType = TopicTypes.LIKE_EVENT;
    readonly eventType: EventTypes;
    readonly userInfo: any;
    constructor(eventType: EventTypes, userInfo: any) {
        super();
        this.eventType = eventType;
        this.userInfo = userInfo;
    }
}