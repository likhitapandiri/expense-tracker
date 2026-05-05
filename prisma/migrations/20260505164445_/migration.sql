-- CreateIndex
CREATE INDEX `Expense_date_idx` ON `Expense`(`date`);

-- RenameIndex
ALTER TABLE `Expense` RENAME INDEX `Expense_userId_fkey` TO `Expense_userId_idx`;
