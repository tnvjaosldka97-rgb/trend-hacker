CREATE TABLE `contents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencerId` int NOT NULL,
	`platform` enum('youtube','twitter') NOT NULL,
	`contentType` enum('video','tweet') NOT NULL,
	`title` text,
	`description` text,
	`url` text NOT NULL,
	`thumbnailUrl` text,
	`platformContentId` varchar(255) NOT NULL,
	`publishedAt` timestamp NOT NULL,
	`viewCount` int,
	`likeCount` int,
	`commentCount` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`platform` enum('youtube','twitter') NOT NULL,
	`handle` varchar(255) NOT NULL,
	`platformUserId` varchar(255),
	`avatarUrl` text,
	`bio` text,
	`followerCount` int,
	`specialty` varchar(255),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `influencers_id` PRIMARY KEY(`id`)
);
