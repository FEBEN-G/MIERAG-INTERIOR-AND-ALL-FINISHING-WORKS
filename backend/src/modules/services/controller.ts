import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error";
import * as servicesService from "./service";

export const listAllServices = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await servicesService.listAllServices());
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await servicesService.createService(req.body));
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  res.json(await servicesService.updateService(req.params.serviceId as string, req.body));
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await servicesService.deleteService(req.params.serviceId as string);
  res.status(204).send();
});

export const reorderServices = asyncHandler(async (req: Request, res: Response) => {
  res.json(await servicesService.reorderServices(req.body));
});
