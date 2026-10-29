import type { Request, Response } from "express";
import { ADMIN_COOKIE_NAME, adminCookieOptions, clearAdminCookie, loadOptionalAdmin } from "../../middleware/auth";
import { AppError, asyncHandler } from "../../middleware/error";
import * as adminService from "./service";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.login(req.body);
  res.cookie(ADMIN_COOKIE_NAME, result.token, adminCookieOptions());
  res.json({ data: { email: result.email, role: result.role } });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAdminCookie(res);
  res.json({ data: { ok: true } });
});

export const session = asyncHandler(async (req: Request, res: Response) => {
  const admin = await loadOptionalAdmin(req, res);
  res.json({ data: admin ? { email: admin.email, role: admin.role } : null });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.admin) {
    throw new AppError(401, "Authentication required");
  }
  res.json({ data: { email: req.admin.email, role: req.admin.role } });
});

export const listApplications = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.listApplications(req.query as Record<string, unknown>);
  res.json(result);
});

export const getApplication = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.getApplicationById(req.params.applicationId as string);
  res.json(result);
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.updateApplicationStatus(
    req.params.applicationId as string,
    req.body,
  );
  res.json(result);
});
