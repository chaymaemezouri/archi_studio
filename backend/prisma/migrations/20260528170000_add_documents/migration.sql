-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT,
    "type" TEXT NOT NULL DEFAULT 'OTHER',
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "projectId" TEXT,
    "clientId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill from ClientDocument
INSERT INTO "Document" (
    "id", "studioId", "name", "originalName", "type", "mimeType", "size", "url",
    "category", "projectId", "clientId", "tags", "description", "createdAt", "updatedAt"
)
SELECT
    cd."id",
    c."studioId",
    cd."name",
    cd."name",
    CASE
        WHEN cd."mimeType" LIKE 'application/pdf%' THEN 'PDF'
        WHEN cd."mimeType" LIKE 'image/%' THEN 'IMAGE'
        WHEN cd."mimeType" LIKE '%wordprocessingml%' THEN 'DOCX'
        WHEN cd."mimeType" LIKE '%spreadsheetml%' THEN 'XLSX'
        WHEN cd."mimeType" LIKE '%zip%' THEN 'ZIP'
        ELSE 'OTHER'
    END,
    cd."mimeType",
    cd."size",
    cd."url",
    CASE cd."docType"
        WHEN 'CONTRACT' THEN 'CONTRACT'
        WHEN 'AUTHORIZATION' THEN 'AUTHORIZATION'
        WHEN 'ADMIN' THEN 'ADMIN'
        WHEN 'ID' THEN 'CLIENT_DOC'
        ELSE 'OTHER'
    END,
    NULL,
    cd."clientId",
    ARRAY[]::TEXT[],
    NULL,
    cd."createdAt",
    cd."createdAt"
FROM "ClientDocument" cd
JOIN "Client" c ON c."id" = cd."clientId";

-- Backfill project documents from ProjectFile (exclude plans/renders)
INSERT INTO "Document" (
    "id", "studioId", "name", "originalName", "type", "mimeType", "size", "url",
    "category", "projectId", "clientId", "tags", "description", "createdAt", "updatedAt"
)
SELECT
    pf."id",
    p."studioId",
    pf."name",
    pf."name",
    CASE
        WHEN pf."mimeType" LIKE 'application/pdf%' THEN 'PDF'
        WHEN pf."mimeType" LIKE 'image/%' THEN 'IMAGE'
        WHEN pf."mimeType" ILIKE '%dwg%' OR pf."fileType" ILIKE '%PLAN%' THEN 'DWG'
        WHEN pf."mimeType" LIKE '%wordprocessingml%' THEN 'DOCX'
        WHEN pf."mimeType" LIKE '%spreadsheetml%' THEN 'XLSX'
        WHEN pf."mimeType" LIKE '%zip%' THEN 'ZIP'
        ELSE 'OTHER'
    END,
    pf."mimeType",
    pf."size",
    pf."url",
    CASE
        WHEN pf."fileType" ILIKE '%CPS%' THEN 'CPS'
        WHEN pf."fileType" ILIKE '%BPU%' THEN 'BPU'
        WHEN pf."fileType" ILIKE '%CONTRAT%' THEN 'CONTRACT'
        ELSE 'PROJECT_DOC'
    END,
    pf."projectId",
    p."clientId",
    ARRAY[]::TEXT[],
    NULL,
    pf."createdAt",
    pf."createdAt"
FROM "ProjectFile" pf
JOIN "Project" p ON p."id" = pf."projectId"
WHERE pf."fileType" NOT ILIKE '%PLAN%'
  AND pf."fileType" NOT ILIKE '%RENDER%'
  AND pf."fileType" NOT ILIKE '%RENDU%'
  AND NOT (pf."fileType" ILIKE '%IMAGE%' AND pf."mimeType" LIKE 'image/%')
ON CONFLICT ("id") DO NOTHING;
