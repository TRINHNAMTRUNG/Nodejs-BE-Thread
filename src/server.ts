import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index";
import { Request, Response } from "express";
// import cors from "cors";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//main 
app.use("/v1/api", routes);

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