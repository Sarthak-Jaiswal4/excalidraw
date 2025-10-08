-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "favorite" TEXT[];

-- CreateTable
CREATE TABLE "public"."_MemberRooms" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MemberRooms_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MemberRooms_B_index" ON "public"."_MemberRooms"("B");

-- AddForeignKey
ALTER TABLE "public"."_MemberRooms" ADD CONSTRAINT "_MemberRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MemberRooms" ADD CONSTRAINT "_MemberRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
