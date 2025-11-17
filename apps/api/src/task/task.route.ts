import { Router } from "express";
import { allTasks, cancelTask, queryTasks, retryTask } from "./task.controller"
import asyncHandler from "@/common/middlewares/async-handler";

const router = Router();

router.get("/", asyncHandler(allTasks));
router.get("/query", asyncHandler(queryTasks));
router.get("/:taskId/cancel", asyncHandler(cancelTask));
router.get("/:taskId/retry", asyncHandler(retryTask));

export default router;
