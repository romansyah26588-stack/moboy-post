CREATE TABLE "User" (
    "id"            TEXT NOT NULL PRIMARY KEY,
    "walletAddress" TEXT NOT NULL,
    "name"          TEXT,
    "profileImage"  TEXT,
    "totalEarnings" REAL NOT NULL DEFAULT 0,
    "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     DATETIME NOT NULL
);

CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

CREATE TABLE "Content" (
    "id"            TEXT NOT NULL PRIMARY KEY,
    "link"          TEXT NOT NULL,
    "userId"        TEXT NOT NULL, 
    "viewCount"     INTEGER NOT NULL DEFAULT 0,
    "isActive"      BOOLEAN NOT NULL DEFAULT 1,
    "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     DATETIME NOT NULL,
    CONSTRAINT "Content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("walletAddress") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Content_link_key" ON "Content"("link");

CREATE TABLE "Earning" (
    "id"            TEXT NOT NULL PRIMARY KEY,
    "userId"        TEXT NOT NULL, 
    "amount"        REAL NOT NULL,
    "description"   TEXT,
    "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Earning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("walletAddress") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER NOT NULL DEFAULT 0
);
