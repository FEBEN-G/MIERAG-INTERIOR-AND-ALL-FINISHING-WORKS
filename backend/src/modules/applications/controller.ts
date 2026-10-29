import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error";
import * as applicationsService from "./service";

export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const result = await applicationsService.createApplication(req.body);
  res.status(201).json(result);
});
