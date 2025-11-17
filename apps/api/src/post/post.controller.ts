import { Account } from "@/account/account.model";
import { BadRequest } from "@/common/custom-error";
import { IAccountDto, IPostFilterDao, ISchedulePostRequest, ISocialPlatform } from "@shared/types";
import { Request, Response } from "express";
import { Post } from "./post.model";
import { GeelarkAPI } from "@/common/platform-api/geelark.serivce";
import { Types } from 'mongoose';
import logger from "@/common/logger";
import { checkBucketExists, createBucket, getS3Url, uploadFile } from "@/common/lib";
import fileUpload from "express-fileupload";
import CONFIG from "@/config";
import { configDotenv } from "dotenv";

configDotenv();

const allowedMediaTypes = ["jpg", "jpeg", "png", "mp4", "mov"];
const imageMedia = ["jpg", "jpeg", "png"];
const videoMedia = ["mp4", "mov"];

const geelarkApi = new GeelarkAPI();

export const allPosts = async (req: Request, res: Response) => {
    const { search, platform, status } = req.query as IPostFilterDao;

    const pipeline: any[] = [];
    const match: any = {};

    // Build match conditions dynamically
    if (platform) match.platform = platform;
    if (status) match.status = status;
    if (search) match.username = { $regex: search, $options: "i" };

    // Apply match stage only if at least one condition exists
    if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
    }

    pipeline.push({ $project: { __v: 0 } }, { $sort: { _id: -1 } });

    const posts = await Post.aggregate(pipeline);
    res.json(posts);
};



export const schedulePost = async (req: Request, res: Response) => {
    const { caption, mediaUrl, scheduleAt, accountIds } = req.body as ISchedulePostRequest;

    const file = req.files?.media as fileUpload.UploadedFile;

    logger.info(`Scheduling a post with ${accountIds}`);

    if (!file && !mediaUrl) {
        throw new BadRequest("Either mediaUrl or file upload is required");
    }

    if (file && mediaUrl) {
        throw new BadRequest("Provide either mediaUrl or file upload, not both");
    }

    const accountIdsArray: string[] =
        typeof accountIds === "string" ? JSON.parse(accountIds) : accountIds;

    const accountObjectIds = accountIdsArray.map((a) => new Types.ObjectId(a));

    const accounts = await Account.find({ _id: { $in: accountObjectIds } });

    if (accounts.length === 0) {
        throw new BadRequest("No valid accounts found for the provided accountIds");
    }

    const mediaType = file ? file.name.split(".").pop() : mediaUrl.split(".").pop();

    if (!mediaType || !allowedMediaTypes.includes(mediaType.toLowerCase())) {
        throw new BadRequest("Unsupported media type. Must be one of " + allowedMediaTypes.join(", "));
    }

    const finalScheduleAt = scheduleAt ? new Date(scheduleAt).getTime() : Date.now();
    const bucketName = process.env.S3_BUCKET || "controller-video-media";

    if (file) {

        // checking for file size
        logger.info("Checking for file size");

        if (file.size >= CONFIG.MAX_FILE_SIZE) {
            logger.info(`File size is more than expected file size actual : ${file.size} expected: ${CONFIG.MAX_FILE_SIZE}`);
            throw new BadRequest(`Cannot upload media more that ${process.env.MAX_FILE_SIZE}mb`);
        }


        // we only upload if there is a file uploaded other-wise none
        const isBucketExists = await checkBucketExists(bucketName);

        if (!isBucketExists) {
            logger.info("No s3 bucket exists creating now")
            await createBucket(bucketName);
        }

        await uploadFile(bucketName, "media-files", file.name, file.data);
    }

    const finalMediaUrl = file ? getS3Url(bucketName, "media-files", file.name) : mediaUrl;

    logger.info(`Final media url is ${finalMediaUrl}`);

    const requestsToSend: Promise<any>[] = [];

    // map each account -> API call
    for (const acc of accounts) {
        if (videoMedia.includes(mediaType)) {
            requestsToSend.push(geelarkApi.publishVideo(finalMediaUrl, caption, acc as IAccountDto, finalScheduleAt));
        } else if (imageMedia.includes(mediaType)) {
            requestsToSend.push(geelarkApi.publishPhoto(finalMediaUrl, caption, acc as IAccountDto, finalScheduleAt));
        }
    }

    // run all requests in parallel
    const responses = await Promise.all(requestsToSend);

    // prepare posts to save with taskId
    const postsToInsert = [];

    for (let i = 0; i < responses.length; i++) {
        const r = responses[i];
        const acc = accounts[i]; // each response matches to its account
        const apiResponse = r.data;

        logger.info(`Api response for ${JSON.stringify(apiResponse)}`);

        if (apiResponse.code === 0 && apiResponse.data?.taskId) {
            postsToInsert.push({
                username: acc.username,
                platform: acc.platform,
                caption,
                mediaUrl: finalMediaUrl,
                mediaType,
                scheduleAt: finalScheduleAt,
                taskId: apiResponse.data.taskId, // ✅ save taskId
                accountId: acc._id,
            });
        } else {
            logger.warn(`Failed to schedule post for ${acc.username}`);
            logger.error(JSON.stringify(apiResponse));
        }
    }

    if (postsToInsert.length > 0) {
        await Post.insertMany(postsToInsert);
        logger.info(`Inserted ${postsToInsert.length} posts successfully`);
    } else {
        logger.warn("No successful posts to insert");
    }

    res.json({
        msg: "Post scheduling completed",
        successCount: postsToInsert.length,
        failedCount: responses.length - postsToInsert.length,
        data: responses.map(r => r.data),
    });
};
