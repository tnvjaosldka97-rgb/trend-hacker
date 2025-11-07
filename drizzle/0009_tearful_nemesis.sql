ALTER TABLE `subscriptions` ADD `onDemandUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `onDemandResetAt` timestamp DEFAULT (now()) NOT NULL;