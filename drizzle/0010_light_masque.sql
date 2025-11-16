CREATE TABLE `freeTrialTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`ipAddress` varchar(45) NOT NULL,
	`deviceFingerprint` varchar(255) NOT NULL,
	`userAgent` text,
	`trialStartedAt` timestamp NOT NULL DEFAULT (now()),
	`trialExpiresAt` timestamp NOT NULL,
	`isBlocked` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `freeTrialTracking_id` PRIMARY KEY(`id`)
);
