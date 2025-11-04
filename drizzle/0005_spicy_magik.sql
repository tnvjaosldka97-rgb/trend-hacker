CREATE TABLE `stockTweets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tweetId` varchar(255) NOT NULL,
	`authorUsername` varchar(255) NOT NULL,
	`authorName` varchar(255),
	`text` text NOT NULL,
	`ticker` varchar(10) NOT NULL,
	`sentiment` enum('bullish','bearish','neutral') NOT NULL,
	`url` text,
	`likeCount` int DEFAULT 0,
	`retweetCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL,
	`collectedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockTweets_id` PRIMARY KEY(`id`),
	CONSTRAINT `stockTweets_tweetId_unique` UNIQUE(`tweetId`)
);
