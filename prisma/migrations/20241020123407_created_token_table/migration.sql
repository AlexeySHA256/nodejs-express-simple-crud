-- CreateEnum
CREATE TYPE "Scopes" AS ENUM ('ACTIVATION', 'AUTHORIZATION');

-- CreateTable
CREATE TABLE "Token" (
    "hash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "scope" "Scopes" NOT NULL DEFAULT 'AUTHORIZATION',

    CONSTRAINT "Token_pkey" PRIMARY KEY ("hash")
);

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
