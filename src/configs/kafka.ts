import { Kafka, Partitioners } from "kafkajs";
import dotenv from "dotenv";
import { TopicTypes } from "../constants/topicTypes";
import { EventTypes } from "../constants/eventTypes";

dotenv.config();
const kafka = new Kafka({
    clientId: process.env.SOURCE as string,
    brokers: ["kafka:9092"]
})

export interface messageValueType<DataMessageType> {
    eventId: string,
    data: DataMessageType,
    userInfo: any,
    eventType: EventTypes,
    topicType: TopicTypes,
    timestamp: string,
    source: string
}

export const kafkaProducer = kafka.producer();

// connect to kafka producer
export const producerConnectToKafka = async () => {
    try {
        await kafkaProducer.connect();
        console.log("Kafka producer connected successfully");
    } catch (error) {
        throw new Error("Error connecting to Kafka producer: " + error);
    }
}

// init kafka topics
export const initKafkaTopics = async () => {
    const admin = kafka.admin();
    await admin.connect();

    try {
        const listTopics = Object.values(TopicTypes);

        // check if topics already exist
        const existingTopics = await admin.listTopics();
        const topicsToCreate = listTopics.filter((topic) => !existingTopics.includes(topic));
        const topicsCreated = listTopics.filter((topic) => existingTopics.includes(topic));

        if (topicsToCreate.length > 0) {
            const topics = topicsToCreate.map((topic) => {
                return {
                    topic: topic,
                    numPartitions: 1,
                    replicationFactor: 1
                }
            })
            await admin.createTopics({
                topics: topics,
                waitForLeaders: true,
            });
            console.log("Kafka topics created successfully: ", topicsToCreate)
        }

        if (topicsCreated.length > 0) {
            console.log("Kafka topics already exist: ", topicsCreated);
        }

    } catch (error) {
        throw new Error("Error creating Kafka topics: " + error);
    } finally {
        await admin.disconnect();
    }
}