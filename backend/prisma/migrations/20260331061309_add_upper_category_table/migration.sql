-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "upper_category_id" INTEGER;

-- AlterTable
ALTER TABLE "EventSubCategory" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "UpperCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpperCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UpperCategory_name_key" ON "UpperCategory"("name");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_upper_category_id_fkey" FOREIGN KEY ("upper_category_id") REFERENCES "UpperCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
