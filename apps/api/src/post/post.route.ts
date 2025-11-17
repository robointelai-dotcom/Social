import asyncHandler from "@/common/middlewares/async-handler";
import { Router } from "express";
import { schedulePost, allPosts } from "./post.controller";
import fileUpload from "express-fileupload";
import CONFIG from "@/config";

const router = Router();

router.get("/", asyncHandler(allPosts));
router.post("/", fileUpload({
    limits: {
        fileSize:
            typeof CONFIG.MAX_FILE_SIZE === "number"
                ? CONFIG.MAX_FILE_SIZE
                : parseInt(CONFIG.MAX_FILE_SIZE),
    },
}), asyncHandler(schedulePost));

export default router;
