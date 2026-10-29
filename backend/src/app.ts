import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { corsMiddleware } from "./config/cors";
import { trustProxySetting } from "./config/env";
import { prisma } from "./config/prisma";
import docsRouter from "./docs/router";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { globalRateLimit } from "./middleware/rateLimit";
import adminRoutes from "./modules/admin/routes";
import applicationsRoutes from "./modules/applications/routes";
import inquiriesRoutes from "./modules/inquiries/routes";
import postsRoutes from "./modules/posts/routes";
import sitesRoutes from "./modules/sites/routes";
import skillsRoutes from "./modules/skills/routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", trustProxySetting());

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(corsMiddleware);
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(globalRateLimit);

  app.get("/", (_req, res) => {
    res.json({
      name: "MIERAG INTERIOR AND ALL FINISHING WORKS API",
      docs: "/api/docs",
      openapi: "/api/docs/openapi.json",
      health: "/api/health",
    });
  });

  app.use("/api/docs", docsRouter);

  app.get("/api/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ok" });
    } catch {
      res.status(503).json({ error: { message: "Service unavailable" } });
    }
  });

  app.use("/api/sites", sitesRoutes);
  app.use("/api/skills", skillsRoutes);
  app.use("/api/posts", postsRoutes);
  app.use("/api/inquiries", inquiriesRoutes);
  app.use("/api/applications", applicationsRoutes);
  app.use("/api/admin", adminRoutes);

  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
