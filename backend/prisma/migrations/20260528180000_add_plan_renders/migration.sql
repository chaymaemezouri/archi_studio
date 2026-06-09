-- CreateTable
CREATE TABLE "PlanRender" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT,
    "kind" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'AUTRE',
    "mimeType" TEXT NOT NULL,
    "fileType" TEXT NOT NULL DEFAULT 'OTHER',
    "size" INTEGER NOT NULL DEFAULT 0,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "projectId" TEXT,
    "clientId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "version" TEXT,
    "isMainImage" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanRender_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PlanRender" ADD CONSTRAINT "PlanRender_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanRender" ADD CONSTRAINT "PlanRender_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlanRender" ADD CONSTRAINT "PlanRender_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill plans from ProjectFile
INSERT INTO "PlanRender" (
    "id", "studioId", "name", "originalName", "kind", "category", "mimeType", "fileType",
    "size", "url", "thumbnailUrl", "projectId", "clientId", "tags", "createdAt", "updatedAt"
)
SELECT
    pf."id",
    p."studioId",
    pf."name",
    pf."name",
    'PLAN',
    CASE
        WHEN pf."fileType" ILIKE '%RDC%' THEN 'PLAN_RDC'
        WHEN pf."fileType" ILIKE '%ETAGE%' THEN 'PLAN_ETAGE'
        WHEN pf."fileType" ILIKE '%TOITURE%' THEN 'PLAN_TOITURE'
        WHEN pf."fileType" ILIKE '%MASSE%' THEN 'PLAN_MASSE'
        WHEN pf."fileType" ILIKE '%FACADE%' THEN 'FACADE'
        WHEN pf."fileType" ILIKE '%COUPE%' THEN 'COUPE'
        ELSE 'AUTRE'
    END,
    pf."mimeType",
    pf."fileType",
    pf."size",
    pf."url",
    CASE WHEN pf."mimeType" LIKE 'image/%' THEN pf."url" ELSE NULL END,
    pf."projectId",
    p."clientId",
    ARRAY[]::TEXT[],
    pf."createdAt",
    pf."createdAt"
FROM "ProjectFile" pf
JOIN "Project" p ON p."id" = pf."projectId"
WHERE pf."fileType" ILIKE '%PLAN%'
   OR pf."mimeType" ILIKE '%dwg%'
   OR pf."fileType" ILIKE '%DWG%'
ON CONFLICT ("id") DO NOTHING;

-- Backfill renders from ProjectFile
INSERT INTO "PlanRender" (
    "id", "studioId", "name", "originalName", "kind", "category", "mimeType", "fileType",
    "size", "url", "thumbnailUrl", "projectId", "clientId", "tags", "isMainImage", "createdAt", "updatedAt"
)
SELECT
    pf."id",
    p."studioId",
    pf."name",
    pf."name",
    'RENDER',
    'AUTRE',
    pf."mimeType",
    pf."fileType",
    pf."size",
    pf."url",
    CASE WHEN pf."mimeType" LIKE 'image/%' THEN pf."url" ELSE NULL END,
    pf."projectId",
    p."clientId",
    ARRAY[]::TEXT[],
    (p."imageUrl" IS NOT NULL AND p."imageUrl" = pf."url"),
    pf."createdAt",
    pf."createdAt"
FROM "ProjectFile" pf
JOIN "Project" p ON p."id" = pf."projectId"
WHERE pf."fileType" ILIKE '%RENDER%'
   OR pf."fileType" ILIKE '%RENDU%'
   OR (pf."fileType" ILIKE '%IMAGE%' AND pf."mimeType" LIKE 'image/%')
ON CONFLICT ("id") DO NOTHING;
