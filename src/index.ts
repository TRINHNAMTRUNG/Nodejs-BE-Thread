
import connection from "./configs/database";
import { initKafkaTopics, producerConnectToKafka } from "./configs/kafka";
import app from "./server";
const HOST_NAME = process.env.HOST_NAME;
const PORT = process.env.PORT || 8087;

(async () => {
    try {
        await connection();
        await initKafkaTopics();
        await producerConnectToKafka();
        app.listen(PORT as number, () => {
            console.log(`Post service is listening on port ${PORT}`);
        })
    } catch (error) {
        console.log("---- BACKEND POST SERVICE ERROR ----");
        console.error(error);
        process.exit(1);
    }
})();