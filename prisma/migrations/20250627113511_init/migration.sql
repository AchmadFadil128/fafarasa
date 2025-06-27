-- CreateTable
CREATE TABLE `Producer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Producer_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cake` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `purchasePrice` DOUBLE NOT NULL,
    `sellingPrice` DOUBLE NOT NULL,
    `producerId` INTEGER NOT NULL,

    UNIQUE INDEX `Cake_name_producerId_key`(`name`, `producerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cakeId` INTEGER NOT NULL,
    `initialStock` INTEGER NOT NULL,
    `remainingStock` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cake` ADD CONSTRAINT `Cake_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyEntry` ADD CONSTRAINT `DailyEntry_cakeId_fkey` FOREIGN KEY (`cakeId`) REFERENCES `Cake`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
