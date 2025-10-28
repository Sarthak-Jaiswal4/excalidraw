/*
  Warnings:

  - You are about to drop the column `favorite` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Room" DROP COLUMN "favorite";

-- CreateTable
CREATE TABLE "public"."_FavoriteRooms" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FavoriteRooms_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FavoriteRooms_B_index" ON "public"."_FavoriteRooms"("B");

-- AddForeignKey
ALTER TABLE "public"."_FavoriteRooms" ADD CONSTRAINT "_FavoriteRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FavoriteRooms" ADD CONSTRAINT "_FavoriteRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
