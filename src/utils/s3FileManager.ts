
import { S3Client, PutObjectCommand, ObjectCannedACL, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { NewFile, Urls } from "../interfaces/index";
dotenv.config();


const bucketName = process.env.BUCKET_NAME!;
const bucketRegion = process.env.BUCKET_REGION!;
const accessKeyIam = process.env.ACCESS_KEY_IAM!;
const secretAccessKeyIam = process.env.SECRET_ACCESS_KEY_IAM!;
const folderImage = "thread-images";
const folderVideo = "thread-videos";

const videoMimeTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-ms-wmv',
    'video/x-msvideo',
    'video/x-flv',
    'video/webm',
    'video/3gpp',
    'video/3gpp2'
];

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyIam,
        secretAccessKey: secretAccessKeyIam
    },
    region: bucketRegion
});

export const generateUniqueFileName = (originalFileName: string): string => {
    const splitName = originalFileName.split('.');
    const uuid = uuidv4();
    return `${splitName[0]}-${uuid}${splitName[1]}`;
};
export const pushObjectS3 = async (file: NewFile): Promise<Urls | null> => {
    const folderName = videoMimeTypes.includes(file.contentType) ? folderVideo : folderImage;
    const key = `${folderName}/${generateUniqueFileName(file.fileName)}`;
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.contentType,
        ACL: ObjectCannedACL.public_read
    }
    const commandPushImage = new PutObjectCommand(params);
    try {
        await s3.send(commandPushImage);
        const strUrl: string = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;
        return { key: key, url: strUrl };
    } catch (error) {
        console.log(`Error when pushing object: ${error}`);
        return null;
    }
}
export const pushManyObjectS3 = async (files: NewFile[]): Promise<Urls[]> => {
    const uploadPromises = files.map(file => pushObjectS3(file));
    const result = await Promise.all(uploadPromises);
    let urls: Urls[] = result.filter(url => url !== null) as Urls[];
    return urls;
}

const deleteObjectS3 = async (key: string): Promise<boolean> => {
    try {
        const params = {
            Bucket: bucketName,
            Key: key
        };

        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        return true;
    } catch (error) {
        console.error(`Error deleting file from S3: ${error}`);
        return false;
    }
};

export const deleteManyObjectS3 = async (keys: string[]): Promise<string[]> => {
    const deletePromises = keys.map(key => deleteObjectS3(key));
    const deleteResults = await Promise.all(deletePromises);
    const failedKeys = keys.filter((e, index) => !deleteResults[index]);
    return failedKeys;
}