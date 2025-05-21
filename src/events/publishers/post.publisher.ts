import { BasePublisher } from "./base.publisher";
import { TopicTypes } from "../../constants/topicTypes";
import { EventTypes } from "../../constants/eventTypes";
import { PostPayloadDTO, DeletePostPayloadDTO, VotePollPayloadDTO } from "../../domains/posts/postResponse.dto";

export class PostPublisher extends BasePublisher<PostPayloadDTO | DeletePostPayloadDTO | VotePollPayloadDTO> {
    readonly topicType = TopicTypes.POST_EVENT;
    readonly eventType: EventTypes;
    readonly userInfo: any;
    constructor(eventType: EventTypes, userInfo: any) {
        super();
        this.eventType = eventType;
        this.userInfo = userInfo;
    }
}