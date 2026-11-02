import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error";
import * as noticesService from "./service";

export const listNotices = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await noticesService.listNotices());
});

export const markNotice = asyncHandler(async (req: Request, res: Response) => {
  res.json(await noticesService.markNotice(req.params.noticeId as string, req.body));
});

export const deleteNotice = asyncHandler(async (req: Request, res: Response) => {
  await noticesService.deleteNotice(req.params.noticeId as string);
  res.status(204).send();
});
