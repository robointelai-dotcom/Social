import { Router } from "express";
import { newAccounts, allAccounts, accDropdown, loginAccount, edit, deleteAcc, newAccountsBulk } from "./account.controller"
import asyncHandler from "@/common/middlewares/async-handler";
import fileUpload from "express-fileupload";
import CONFIG from "@/config";

const router = Router();

router.post("/bulk", fileUpload({
    limits: {
        fileSize:
            typeof CONFIG.MAX_FILE_SIZE === "number"
                ? CONFIG.MAX_FILE_SIZE
                : parseInt(CONFIG.MAX_FILE_SIZE),
    },
}), asyncHandler(newAccountsBulk));
router.post("/", asyncHandler(newAccounts));
router.get("/", asyncHandler(allAccounts));
router.patch("/:id", asyncHandler(edit));
router.get("/:id/login", asyncHandler(loginAccount));
router.get("/dropdown", asyncHandler(accDropdown));
router.delete("/:id", asyncHandler(deleteAcc));

export default router;
