import { EventTypes } from "../../constants/eventTypes";
import { v4 as uuid } from "uuid";
import { kafkaProducer, messageValueType } from "../../configs/kafka";
import dotenv from "dotenv";
import { TopicTypes } from "../../constants/topicTypes";
dotenv.config();

export abstract class BasePublisher<DataMessageType> {
    abstract topicType: TopicTypes;
    abstract eventType: EventTypes;
    abstract userInfo: any;

    async publish(data: DataMessageType) {
        const messageValue: messageValueType<DataMessageType> = {
            eventId: uuid(),
            data,
            userInfo: this.userInfo,
            eventType: this.eventType,
            topicType: this.topicType,
            timestamp: new Date().toISOString(),
            source: process.env.SOURCE as string
        }
        await kafkaProducer.send({
            topic: this.topicType,
            messages: [
                {
                    key: (data as any)._id.toString(),
                    value: JSON.stringify(messageValue)
                }
            ]
        })
    }
}