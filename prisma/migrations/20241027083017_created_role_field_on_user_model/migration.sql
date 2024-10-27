-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('USER', 'ADMIN', 'DEV');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRoles" NOT NULL DEFAULT 'USER';
