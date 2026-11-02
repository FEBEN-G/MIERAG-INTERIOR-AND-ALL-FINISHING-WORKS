-- AlterTable
ALTER TABLE "admins" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "admin_notices" ADD COLUMN "applicationId" UUID;
ALTER TABLE "posts" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "titleAm" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionAm" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");
CREATE INDEX "services_published_sortOrder_idx" ON "services"("published", "sortOrder");
CREATE UNIQUE INDEX "admin_notices_applicationId_key" ON "admin_notices"("applicationId");
CREATE INDEX "admin_notices_createdAt_idx" ON "admin_notices"("createdAt");
CREATE INDEX "applications_status_createdAt_idx" ON "applications"("status", "createdAt");
CREATE INDEX "applications_createdAt_idx" ON "applications"("createdAt");
CREATE INDEX "applications_skillCategoryId_idx" ON "applications"("skillCategoryId");
CREATE INDEX "inquiries_createdAt_idx" ON "inquiries"("createdAt");
CREATE INDEX "notification_failures_applicationId_idx" ON "notification_failures"("applicationId");
CREATE INDEX "posts_published_sortOrder_idx" ON "posts"("published", "sortOrder");
CREATE INDEX "site_required_skills_skillCategoryId_idx" ON "site_required_skills"("skillCategoryId");
CREATE INDEX "sites_status_createdAt_idx" ON "sites"("status", "createdAt");
CREATE INDEX "sites_createdAt_idx" ON "sites"("createdAt");

-- AddForeignKey
ALTER TABLE "admin_notices" ADD CONSTRAINT "admin_notices_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data rules the database enforces itself, whatever writes to it. Prisma's schema cannot express these.
ALTER TABLE "sites"
  ADD CONSTRAINT "sites_compensation_valid" CHECK (
    ("compensationMin" IS NULL OR "compensationMin" >= 0)
    AND ("compensationMax" IS NULL OR "compensationMax" >= 0)
    AND ("compensationMin" IS NULL OR "compensationMax" IS NULL OR "compensationMin" <= "compensationMax")
  ),
  ADD CONSTRAINT "sites_worker_count_valid" CHECK ("currentWorkerCount" >= 0),
  ADD CONSTRAINT "sites_location_valid" CHECK (
    ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90)
    AND ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180)
  ),
  ADD CONSTRAINT "sites_dates_valid" CHECK (
    "startDate" IS NULL OR "expectedCompletionDate" IS NULL OR "startDate" <= "expectedCompletionDate"
  );
ALTER TABLE "site_required_skills"
  ADD CONSTRAINT "site_required_skills_workers_valid" CHECK ("workersNeeded" IS NULL OR "workersNeeded" > 0);
ALTER TABLE "applications"
  ADD CONSTRAINT "applications_rate_valid" CHECK ("expectedRate" >= 0),
  ADD CONSTRAINT "applications_experience_valid" CHECK ("experienceYears" BETWEEN 0 AND 50);
