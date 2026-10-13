/*
  Warnings:

  - You are about to alter the column `amount` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(12,2)`.
  - A unique constraint covering the columns `[userId,name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Category_name_key` ON `Category`;

-- DropIndex
DROP INDEX `Expense_date_idx` ON `Expense`;

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `isDefault` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Expense` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `amount` DECIMAL(12, 2) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `passwordHash` VARCHAR(191) NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `Category_userId_idx` ON `Category`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Category_userId_name_key` ON `Category`(`userId`, `name`);

-- CreateIndex
CREATE INDEX `Expense_userId_date_idx` ON `Expense`(`userId`, `date`);

-- CreateIndex
CREATE INDEX `Expense_userId_categoryId_date_idx` ON `Expense`(`userId`, `categoryId`, `date`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
