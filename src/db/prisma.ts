import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()

export const NotFoundErrCode = "P2025"
export const UniqueViolationErrCode = "P2002"
export const ForeignKeyViolationErrCode = "P2003"