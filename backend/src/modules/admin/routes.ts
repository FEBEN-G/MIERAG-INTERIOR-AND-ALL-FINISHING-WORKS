import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { loginRateLimit } from "../../middleware/rateLimit";
import * as controller from "./controller";
import * as notices from "../notices/controller";
import * as posts from "../posts/controller";
import * as sites from "../sites/controller";

const router = Router();

router.post("/auth/login", loginRateLimit, controller.login);
router.post("/auth/logout", controller.logout);
router.get("/session", controller.session);
router.get("/me", requireAuth, controller.me);
router.get("/applications", requireAuth, controller.listApplications);
router.get("/applications/:applicationId", requireAuth, controller.getApplication);
router.patch(
  "/applications/:applicationId/status",
  requireAuth,
  controller.updateApplicationStatus,
);
router.get("/notices", requireAuth, notices.listNotices);
router.patch("/notices/:noticeId", requireAuth, notices.markNotice);
router.get("/posts", requireAuth, posts.listAll);
router.post("/posts", requireAuth, posts.createPost);
router.patch("/posts/:postId", requireAuth, posts.updatePost);
router.delete("/posts/:postId", requireAuth, posts.deletePost);
router.post("/sites", requireAuth, sites.createSite);
router.patch("/sites/:siteId", requireAuth, sites.updateSite);
router.delete("/sites/:siteId", requireAuth, sites.deleteSite);

export default router;
