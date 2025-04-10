
import connection from "./configs/database";
import app from "./server";
const HOST_NAME = process.env.HOST_NAME;
const PORT = process.env.PORT || 8087;

(async () => {
    try {
        await connection();
        app.listen(PORT as number, HOST_NAME as string, () => {
            console.log(`Post service is listening on port ${PORT}`);
        })
    } catch (error) {
        console.log("BACKEND POST SERVICE ERROR CONNECT TO DBS: ", error);
    }
})();