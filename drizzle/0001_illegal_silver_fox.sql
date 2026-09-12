CREATE TABLE `appointments` (
	`id` varchar(64) NOT NULL,
	`doctorId` int NOT NULL,
	`patientName` varchar(160) NOT NULL,
	`patientEmail` varchar(320),
	`date` varchar(20) NOT NULL,
	`time` varchar(20) NOT NULL,
	`status` varchar(40) NOT NULL DEFAULT 'pending_payment',
	`stripePaymentIntentId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`specialty` varchar(120) NOT NULL,
	`qualifications` varchar(240) NOT NULL,
	`experienceYears` int NOT NULL,
	`fee` int NOT NULL,
	`clinic` varchar(180) NOT NULL,
	`address` varchar(240) NOT NULL,
	`rating` decimal(3,1) NOT NULL,
	`ratingCount` int NOT NULL,
	`about` text NOT NULL,
	`accent` varchar(20) NOT NULL,
	`available` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergencyEvents` (
	`id` varchar(64) NOT NULL,
	`patientName` varchar(160),
	`phone` varchar(40),
	`location` varchar(320),
	`notes` text,
	`hospitalPhone` varchar(40) NOT NULL,
	`status` varchar(40) NOT NULL DEFAULT 'alert_created',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emergencyEvents_id` PRIMARY KEY(`id`)
);
