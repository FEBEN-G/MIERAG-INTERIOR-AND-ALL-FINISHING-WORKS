import express, { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { loginRateLimit } from "../../middleware/rateLimit";
import * as controller from "./controller";
import * as notices from "../notices/controller";
import * as posts from "../posts/controller";
import * as settings from "../settings/controller";
import * as sites from "../sites/controller";
import * as skills from "../skills/controller";
import * as uploads from "../uploads/controller";
import { MAX_UPLOAD_BYTES, UPLOAD_CONTENT_TYPES } from "../uploads/service";

const router = Router();

router.post("/auth/login", loginRateLimit, controller.login);
router.post("/auth/logout", controller.logout);
router.get("/session", controller.session);
router.get("/me", requireAuth, controller.me);
router.post("/password", loginRateLimit, requireAuth, controller.changePassword);
router.get("/applications", requireAuth, controller.listApplications);
router.get("/applications/:applicationId", requireAuth, controller.getApplication);
router.patch(
  "/applications/:applicationId/status",
  requireAuth,
  controller.updateApplicationStatus,
);
router.delete("/applications/:applicationId", requireAuth, controller.deleteApplication);
router.get("/notices", requireAuth, notices.listNotices);
router.patch("/notices/:noticeId", requireAuth, notices.markNotice);
router.delete("/notices/:noticeId", requireAuth, notices.deleteNotice);
router.get("/posts", requireAuth, posts.listAll);
router.post("/posts", requireAuth, posts.createPost);
router.patch("/posts/:postId", requireAuth, posts.updatePost);
router.delete("/posts/:postId", requireAuth, posts.deletePost);
router.post("/sites", requireAuth, sites.createSite);
router.patch("/sites/:siteId", requireAuth, sites.updateSite);
router.delete("/sites/:siteId", requireAuth, sites.deleteSite);
router.get("/skills", requireAuth, skills.listAllSkills);
router.post("/skills", requireAuth, skills.createSkill);
router.patch("/skills/:skillId", requireAuth, skills.updateSkill);
router.patch("/settings", requireAuth, settings.updateSettings);
// The raw parser runs after requireAuth, so only a signed-in admin can send a large body.
router.post(
  "/uploads",
  requireAuth,
  express.raw({ type: UPLOAD_CONTENT_TYPES, limit: MAX_UPLOAD_BYTES }),
  uploads.createUpload,
);

export default router;
