-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profileType" TEXT NOT NULL,
    "callType" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "dealName" TEXT,
    "setupName" TEXT,
    "setupEmail" TEXT,
    "callDate" TEXT,
    "startTime" TEXT,
    "timeZone" TEXT,
    "hostPasscode" TEXT,
    "guestPasscode" TEXT,
    "conferenceId" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Profile_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("callDate", "callType", "companyName", "conferenceId", "createdAt", "dealName", "guestPasscode", "hostPasscode", "id", "notes", "profileType", "setupEmail", "setupName", "startTime", "timeZone", "updatedAt") SELECT "callDate", "callType", "companyName", "conferenceId", "createdAt", "dealName", "guestPasscode", "hostPasscode", "id", "notes", "profileType", "setupEmail", "setupName", "startTime", "timeZone", "updatedAt" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
