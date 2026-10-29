-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('STRUCTURAL_WORK', 'ROUGH_IN', 'FINAL_FINISHING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'SHORTLISTED', 'CONTACTED', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "sites" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SiteStatus" NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "estimatedDuration" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "expectedCompletionDate" TIMESTAMP(3),
    "currentWorkerCount" INTEGER NOT NULL DEFAULT 0,
    "coverImageUrl" TEXT NOT NULL,
    "compensationMin" INTEGER,
    "compensationMax" INTEGER,
    "compensationNote" TEXT,
    "isPreview" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_required_skills" (
    "siteId" UUID NOT NULL,
    "skillCategoryId" UUID NOT NULL,
    "workersNeeded" INTEGER,

    CONSTRAINT "site_required_skills_pkey" PRIMARY KEY ("siteId","skillCategoryId")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "skillCategoryId" UUID NOT NULL,
    "expectedRate" INTEGER NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "experienceDetails" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_failures" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_failures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_slug_key" ON "skill_categories"("slug");

-- CreateIndex
CREATE INDEX "applications_siteId_phoneNumber_idx" ON "applications"("siteId", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "site_required_skills" ADD CONSTRAINT "site_required_skills_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_required_skills" ADD CONSTRAINT "site_required_skills_skillCategoryId_fkey" FOREIGN KEY ("skillCategoryId") REFERENCES "skill_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_skillCategoryId_fkey" FOREIGN KEY ("skillCategoryId") REFERENCES "skill_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_failures" ADD CONSTRAINT "notification_failures_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
