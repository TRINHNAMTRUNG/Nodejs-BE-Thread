import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
interface DBState {
    value: number;
    label: string;
}
const dbState: readonly DBState[] = [
    { value: 0, label: "Disconnected" },
    { value: 1, label: "Connected" },
    { value: 2, label: "Connecting" },
    { value: 3, label: "Disconnecting" },
    { value: 99, label: "uninitialized" }
]

const connection = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.DB_HOST as string, {
            dbName: process.env.DB_NAME
        });
        console.log("Connection status: ", dbState.find(state => state.value === mongoose.connection.readyState)?.label)
    } catch (error) {
        console.log("MongoDB connection error: ", error);
        process.exit(1);
    }
}

export default connection;
