import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error";
import * as sitesService from "./service";

export const listSites = asyncHandler(async (req: Request, res: Response) => {
  const result = await sitesService.listSites(req.query as Record<string, unknown>);
  res.json(result);
});

export const getSite = asyncHandler(async (req: Request, res: Response) => {
  const site = await sitesService.getSiteById(req.params.siteId as string);
  res.json({ data: site });
});

export const createSite = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await sitesService.createSite(req.body));
});

export const updateSite = asyncHandler(async (req: Request, res: Response) => {
  res.json(await sitesService.updateSite(req.params.siteId as string, req.body));
});

export const deleteSite = asyncHandler(async (req: Request, res: Response) => {
  await sitesService.deleteSite(req.params.siteId as string);
  res.status(204).send();
});
