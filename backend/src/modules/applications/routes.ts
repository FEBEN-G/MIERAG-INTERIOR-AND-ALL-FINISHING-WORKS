import { Router } from "express";
import { applicationRateLimit } from "../../middleware/rateLimit";
import * as controller from "./controller";

const router = Router();

router.post("/", applicationRateLimit, controller.createApplication);

export default router;
