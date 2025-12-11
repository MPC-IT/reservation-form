-- CreateTable
CREATE TABLE "Profile" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
