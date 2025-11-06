CREATE TABLE `aiReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planType` enum('pro','premium') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`reportDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiReports_id` PRIMARY KEY(`id`)
);
