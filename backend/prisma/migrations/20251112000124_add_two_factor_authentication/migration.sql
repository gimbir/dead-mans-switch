-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastBackupCodeUsedAt" TIMESTAMP(3),
ADD COLUMN     "twoFactorBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;
