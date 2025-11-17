import { Router } from "express";
import { allMobiles, mobilesDropdown, refreshMobiles } from "./mobile.controller"
import asyncHandler from "@/common/middlewares/async-handler";

const router = Router();

router.get("/", asyncHandler(allMobiles));
router.get("/refresh", asyncHandler(refreshMobiles));
router.get("/dropdown", asyncHandler(mobilesDropdown));

export default router;
