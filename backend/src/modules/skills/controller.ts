import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error";
import * as skillsService from "./service";

export const listSkills = asyncHandler(async (_req: Request, res: Response) => {
  const result = await skillsService.listActiveSkills();
  res.json(result);
});
