import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import routes from "./src/routes/index";
// import cors from "cors";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/v1/api", routes);

export default app;