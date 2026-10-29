import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error";
import * as inquiriesService from "./service";

export const createInquiry = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await inquiriesService.createInquiry(req.body));
});
