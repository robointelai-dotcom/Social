import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListBucketsCommand,
  PutBucketPolicyCommand,
  PutPublicAccessBlockCommand,
} from "@aws-sdk/client-s3";
import Config from "../config";
// import nodemailer from "nodemailer";
// import { readFile } from "fs/promises";

import logger from "./logger";


const s3Client = new S3Client({
  region: Config.S3_REGION,
  credentials: {
    accessKeyId: Config.S3_ACCESS_ID,
    secretAccessKey: Config.S3_ACCESS_KEY,
  },
});

export const checkBucketExists = async (bucketName: string) => {
  const listBucketsCommand = new ListBucketsCommand({
    BucketRegion: Config.S3_REGION,
    MaxBuckets: 100,
  });

  const listBucketResponse = await s3Client.send(listBucketsCommand);

  if (!listBucketResponse.Buckets) {
    console.log(`Bucket with name ${bucketName} not found`);
    return false;
  }

  return listBucketResponse.Buckets.find((b) => b.Name == bucketName);
};

const getBucketPolicy = (bucketName: string) => ({
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadGetObject",
      Effect: "Allow",
      Principal: "*",
      Action: "s3:GetObject",
      Resource: `arn:aws:s3:::${bucketName}/*`, // Allows public read access to all objects in the bucket
    },
  ],
});

export const createBucket = async (bucketName: string) => {
  logger.info(`Got a request to create bucket with name ${bucketName}`);

  const createBucketCommand = new CreateBucketCommand({
    Bucket: bucketName,
  });

  const bucketPolicy = JSON.stringify(getBucketPolicy(bucketName));

  const putBucketPolicyCommand = new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: bucketPolicy,
  });

  const putBucketInPublicCommand = new PutPublicAccessBlockCommand({
    Bucket: bucketName,
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: false,
      IgnorePublicAcls: false,
      BlockPublicPolicy: false,
      RestrictPublicBuckets: false,
    },
  });

  const createBucketResponse = await s3Client.send(createBucketCommand);

  logger.info(`Created a bucket with name ${bucketName}, assigning policies`);

  await s3Client.send(putBucketInPublicCommand);
  await s3Client.send(putBucketPolicyCommand);

  logger.info(`Bucket with name ${bucketName} created and assigned policies`);

  return createBucketResponse;
};

export const deleteBucket = async (bucketName: string) => {
  const isBucketExists = await checkBucketExists(bucketName);

  if (!isBucketExists) {
    return;
  }

  const deleteBucketCommand = new DeleteBucketCommand({
    Bucket: bucketName,
  });

  const deleteBucketResponse = await s3Client.send(deleteBucketCommand);

  return deleteBucketResponse;
};

export const deleteFile = async (
  bucketName: string,
  username: string,
  fileName: string
) => {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: `${username}/${fileName}`,
  });

  const deleteObjResponse = await s3Client.send(deleteCommand);

  return deleteObjResponse;
};

export const uploadFile = async (
  bucketName: string,
  username: string,
  fileName: string,
  body: Buffer,
  metadata?: Record<string, string>
) => {
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: `${username}/${fileName}`,
    Body: body,
    Metadata: metadata,
  });

  const putCommandResponse = await s3Client.send(putCommand);

  return putCommandResponse;
};

export const getS3Url = (
  bucketName: string,
  folderName: string,
  fileName: string
) => {
  return `https://${bucketName}.${Config.S3_ENDPOINT}/${folderName}/${fileName}`;
};

// /**
//  * @description - nodemailer transporter
//  * @returns - nothing
//  * instance of nodemailer transporter
//  */
// const transporter = nodemailer.createTransport(Config.SMTP_URL);

// export const sendMail = async (
//   to: string | string[],
//   subject: string,
//   templateName: string,
//   vars?: Record<string, string>
// ) => {
//   const filePath = join(
//     process.cwd(),
//     "private",
//     "templates",
//     templateName
//   );

//   if (!existsSync(filePath)) {
//     throw new Error("Template file does not exist");
//   }

//   let htmlContent = await readFile(filePath, "utf-8");

//   if (vars) {
//     for (const key in vars) {
//       const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
//       htmlContent = htmlContent.replace(regex, vars[key]);
//     }
//   }

//   console.log(`Sending mail to ${to}`);

//   await transporter.sendMail({
//     from: Config.SMTP_FROM,
//     to,
//     subject,
//     html: htmlContent,
//   });

//   console.log(`Sent mail to ${to}`);
// };

// export const convertDateToUnixTimeStamp = (date: string | Date): number => {
//   let result = 0;
//   let parsedDate: Date;

//   if (typeof date === "string") {
//     parsedDate = new Date(date);
//   } else {
//     parsedDate = date;
//   }

//   // Check for invalid date
//   if (isNaN(parsedDate.getTime())) {
//     return 0; // or throw new Error("Invalid date");
//   }

//   result = Math.floor(parsedDate.getTime() / 1000);
//   return result;
// };

// export const toTitleCase = (val: string) =>
//   String(val).charAt(0).toUpperCase() + String(val).slice(1);
