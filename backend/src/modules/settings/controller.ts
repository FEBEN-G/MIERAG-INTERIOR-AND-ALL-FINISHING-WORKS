import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error";
import * as settingsService from "./service";

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await settingsService.getSettings());
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  res.json(await settingsService.updateSettings(req.body));
});
