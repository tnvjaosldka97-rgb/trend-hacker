CREATE TABLE `expertAccuracy` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencerId` int NOT NULL,
	`totalPredictions` int NOT NULL DEFAULT 0,
	`correctPredictions` int NOT NULL DEFAULT 0,
	`accuracyRate` int NOT NULL DEFAULT 0,
	`grade` enum('S','A','B','C','D') NOT NULL DEFAULT 'C',
	`weight` int NOT NULL DEFAULT 100,
	`last30DaysAccuracy` int NOT NULL DEFAULT 0,
	`last90DaysAccuracy` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expertAccuracy_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictionResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`predictionId` int NOT NULL,
	`priceAfter7Days` int,
	`priceChange` int,
	`isCorrect` int NOT NULL,
	`verifiedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictionResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`influencerId` int NOT NULL,
	`ticker` varchar(10) NOT NULL,
	`sentiment` enum('bullish','bearish','neutral') NOT NULL,
	`priceAtPrediction` int,
	`predictedDate` timestamp NOT NULL,
	`verificationDate` timestamp,
	`isVerified` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
