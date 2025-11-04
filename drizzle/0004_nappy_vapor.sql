CREATE TABLE `systemMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemMetadata_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemMetadata_key_unique` UNIQUE(`key`)
);
