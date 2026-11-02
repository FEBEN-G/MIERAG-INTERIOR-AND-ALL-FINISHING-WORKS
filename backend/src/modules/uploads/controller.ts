import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error";
import * as uploadsService from "./service";

export const createUpload = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await uploadsService.saveUpload(req.body));
});
