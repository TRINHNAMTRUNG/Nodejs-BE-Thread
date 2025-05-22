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
    const lastDotIndex = originalFileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return `${originalFileName}-${uuidv4()}`;
    }

    const baseName = originalFileName.substring(0, lastDotIndex);
    const extension = originalFileName.substring(lastDotIndex + 1);
    return `${baseName}-${uuidv4()}.${extension}`;
};

export const pushObjectS3 = async (file: NewFile): Promise<Urls | null> => {
    if (!file.buffer || !file.fileName) {
        console.error("Invalid file data provided");
        return null;
    }

    try {
        const folderName = videoMimeTypes.includes(file.contentType) ? folderVideo : folderImage;
        const key = `${folderName}/${generateUniqueFileName(file.fileName)}`;

        const params = {
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.contentType,
            ACL: ObjectCannedACL.public_read
        };

        const commandPushImage = new PutObjectCommand(params);
        await s3.send(commandPushImage);

        const strUrl: string = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;
        return { key: key, url: strUrl };
    } catch (error) {
        console.error(`Error when pushing object to S3:`, error);
        return null;
    }
};

export const pushManyObjectS3 = async (files: NewFile[]): Promise<Urls[]> => {
    if (!files || files.length === 0) {
        return [];
    }

    try {
        const uploadPromises = files.map(file => pushObjectS3(file));
        const results = await Promise.all(uploadPromises);

        // Filter out null results
        return results.filter(url => url !== null) as Urls[];
    } catch (error) {
        console.error("Error in pushManyObjectS3:", error);
        return [];
    }
};

export const deleteObjectS3 = async (key: string): Promise<boolean> => {
    if (!key) {
        console.warn("Attempted to delete object with empty key");
        return false;
    }

    try {
        const params = {
            Bucket: bucketName,
            Key: key
        };

        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        return true;
    } catch (error) {
        console.error(`Error deleting file from S3 (key: ${key}):`, error);
        return false;
    }
};

export const deleteManyObjectS3 = async (keys: string[]): Promise<string[]> => {
    if (!keys || keys.length === 0) {
        return [];
    }

    try {
        const deletePromises = keys.map(key => deleteObjectS3(key));
        const deleteResults = await Promise.all(deletePromises);

        // Collect keys that failed to delete
        return keys.filter((key, index) => !deleteResults[index]);
    } catch (error) {
        console.error("Error in deleteManyObjectS3:", error);
        return keys; // Return all keys as failed if there's an error
    }
};