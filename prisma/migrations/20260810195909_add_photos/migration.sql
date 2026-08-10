-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "portfolioImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "profilePicUrl" TEXT;
