import "reflect-metadata";
import express, { NextFunction } from "express";
import dotenv from "dotenv";
import routes from "./routes/index";
import { Request, Response } from "express";
import { AppError } from "./utils/AppError";
import httpStatus from "http-status";
import { errorConverter, errorHandler } from "./middlewares/handleErorr.middleware";
// import cors from "cors";
dotenv.config();

const app = express();

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// api routes
// app.use((req, res, next) => {
//     console.log(`Nhận yêu cầu: ${req.method} ${req.url}`);
//     console.log('Headers:', req.headers);
//     next();
// });
app.use("/api", routes);

// send back a 404 error for any unknow api request
app.use((req: Request, res: Response, next: NextFunction) => {
    next(AppError.logic("api not found", httpStatus.NOT_FOUND, httpStatus["404_NAME"]));
})

// convert error
app.use(errorConverter);

// handle error
app.use(errorHandler);

//----Test routes
// import multer from "multer";
// import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
// import { buffer } from "stream/consumers";

// const router = express.Router();
// const upload = multer();

// const bucketName = process.env.BUCKET_NAME;
// const bucketRegion = process.env.BUCKET_REGION!;
// const accessKeyIam = process.env.ACCESS_KEY_IAM!;
// const secretAccessKeyIam = process.env.SECRET_ACCESS_KEY_IAM!;

// const s3 = new S3Client({
//     credentials: {
//         accessKeyId: accessKeyIam,
//         secretAccessKey: secretAccessKeyIam
//     },
//     region: bucketRegion
// })

// router.post("/test", upload.array("image"), async (req: Request, res: Response) => {
//     // const fileBinary = req.file?.buffer;
//     // const params = {
//     //     Bucket: bucketName,
//     //     Key: `thread-images/${req.file?.originalname}`,
//     //     Body: req.file?.buffer,
//     //     ContentType: req.file?.mimetype,
//     //     ACL: ObjectCannedACL.public_read
//     // }
//     // const command = new PutObjectCommand(params);
//     // await s3.send(command);
//     console.log(">>>>", req);
// });

// app.use("/v1/api", router);

//------

export default app;