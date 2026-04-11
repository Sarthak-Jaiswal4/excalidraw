/*
  Warnings:

  - You are about to drop the `_FavoriteRooms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MemberRooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_FavoriteRooms" DROP CONSTRAINT "_FavoriteRooms_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_FavoriteRooms" DROP CONSTRAINT "_FavoriteRooms_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MemberRooms" DROP CONSTRAINT "_MemberRooms_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MemberRooms" DROP CONSTRAINT "_MemberRooms_B_fkey";

-- DropTable
DROP TABLE "public"."_FavoriteRooms";

-- DropTable
DROP TABLE "public"."_MemberRooms";

-- CreateTable
CREATE TABLE "public"."RoomMember" (
    "userId" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "RoomMember_pkey" PRIMARY KEY ("userId","roomId")
);

-- CreateTable
CREATE TABLE "public"."RoomFavorite" (
    "userId" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "RoomFavorite_pkey" PRIMARY KEY ("userId","roomId")
);

-- CreateIndex
CREATE INDEX "RoomMember_roomId_idx" ON "public"."RoomMember"("roomId");

-- CreateIndex
CREATE INDEX "RoomMember_userId_idx" ON "public"."RoomMember"("userId");

-- CreateIndex
CREATE INDEX "RoomFavorite_roomId_idx" ON "public"."RoomFavorite"("roomId");

-- CreateIndex
CREATE INDEX "RoomFavorite_userId_idx" ON "public"."RoomFavorite"("userId");

-- CreateIndex
CREATE INDEX "Chat_roomId_idx" ON "public"."Chat"("roomId");

-- CreateIndex
CREATE INDEX "Chat_userId_idx" ON "public"."Chat"("userId");

-- CreateIndex
CREATE INDEX "Room_adminId_idx" ON "public"."Room"("adminId");

-- AddForeignKey
ALTER TABLE "public"."RoomMember" ADD CONSTRAINT "RoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomMember" ADD CONSTRAINT "RoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomFavorite" ADD CONSTRAINT "RoomFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomFavorite" ADD CONSTRAINT "RoomFavorite_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
