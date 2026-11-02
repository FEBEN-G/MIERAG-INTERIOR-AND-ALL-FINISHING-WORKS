import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error";
import * as skillsService from "./service";

export const listSkills = asyncHandler(async (_req: Request, res: Response) => {
  const result = await skillsService.listActiveSkills();
  res.json(result);
});

export const listAllSkills = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await skillsService.listAllSkills());
});

export const createSkill = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await skillsService.createSkill(req.body));
});

export const updateSkill = asyncHandler(async (req: Request, res: Response) => {
  res.json(await skillsService.updateSkill(req.params.skillId as string, req.body));
});
