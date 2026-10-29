import { Router } from "express";
import { inquiryRateLimit } from "../../middleware/rateLimit";
import * as controller from "./controller";

const router = Router();

router.post("/", inquiryRateLimit, controller.createInquiry);

export default router;
