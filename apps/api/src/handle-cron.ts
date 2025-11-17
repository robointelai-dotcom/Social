import { schedule } from "node-cron";
import logger from "@/common/logger";
import { GeelarkAPI } from "@/common/platform-api/geelark.serivce";
import { Post } from "@/post/post.model";
import { Account } from "@/account/account.model";
import { IAccountDto } from "@shared/types";

const geelarkApi = new GeelarkAPI();

const randomKeywords = ["food", "cakes", "midnight cravings"];

const getTasksAndUpdatePostStatus = async () => {
    // this will run every minute to fetch the status of the task and update it
    try {
        logger.info("Running the posts cron job to update status");

        const postsToCheck = await Post.find(
            { status: { $ne: "Completed" } },
            { taskId: 1, status: 1 }
        );

        if (!postsToCheck.length) {
            logger.info("No posts found to update");
            return;
        }

        const taskIds = postsToCheck.map((p) => p.taskId).filter(Boolean);

        if (!taskIds.length) {
            logger.info("No valid taskIds found");
            return;
        }

        logger.info(`Found ${taskIds.length} posts to fetch status for`);

        const liveTasks = await geelarkApi.queryTasks(taskIds as string[]);

        if (!liveTasks || !liveTasks.length) {
            logger.info("No live tasks returned from geelark API");
            return;
        }

        const bulkOps = [];

        for (const task of liveTasks) {
            const post = postsToCheck.find((p) => p.taskId === task.id);
            if (!post) continue;

            if (task.status && task.status !== post.status) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: post._id },
                        update: { $set: { status: task.status, updatedAt: new Date() } },
                    },
                });
            }
        }

        if (bulkOps.length) {
            await Post.bulkWrite(bulkOps);
            logger.info(`Updated ${bulkOps.length} posts successfully`);
        } else {
            logger.info("No posts required status updates");
        }

    } catch (error) {
        logger.error("Error while fetching tasks and updating database", error);
    }
};

const doRandomWarmup = async () => {
    try {
        logger.info("Running random warmup task");

        const accounts = await Account.find({}, { __v: 0 });
        const warmupRequests = accounts.map(a => geelarkApi.warmup(a as IAccountDto, randomKeywords));
        const warmupRes = await Promise.all(warmupRequests);
        logger.info(`Completed random warmup task with response ${JSON.stringify(warmupRes)}`);
    } catch (error) {
        logger.error(`Error while doing warup for accounts ${JSON.stringify(error)}`);
    }
}

export const handleCron = () => {
    // runs every minute
    schedule("*/1 * * * *", getTasksAndUpdatePostStatus);
    schedule("0 0 * * *", doRandomWarmup);
};