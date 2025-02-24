/*
  Warnings:

  - A unique constraint covering the columns `[gmail_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gmail_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "auction" DROP CONSTRAINT "auction_category_id_fkey";

-- DropForeignKey
ALTER TABLE "auction" DROP CONSTRAINT "auction_status_id_fkey";

-- DropForeignKey
ALTER TABLE "category" DROP CONSTRAINT "category_location_id_fkey";

-- DropForeignKey
ALTER TABLE "category" DROP CONSTRAINT "category_status_id_fkey";

-- DropForeignKey
ALTER TABLE "photo" DROP CONSTRAINT "photo_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "photo" DROP CONSTRAINT "photo_category_id_fkey";

-- DropForeignKey
ALTER TABLE "photo" DROP CONSTRAINT "photo_location_id_fkey";

-- DropForeignKey
ALTER TABLE "photo" DROP CONSTRAINT "photo_status_id_fkey";

-- DropForeignKey
ALTER TABLE "photo" DROP CONSTRAINT "photo_user_id_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "gmail_id" TEXT NOT NULL,
ALTER COLUMN "role_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_gmail_id_key" ON "user"("gmail_id");

-- AddForeignKey
ALTER TABLE "auction" ADD CONSTRAINT "auction_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auction" ADD CONSTRAINT "auction_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
