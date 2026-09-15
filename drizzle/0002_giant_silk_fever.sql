CREATE TABLE `hospitalAppointments` (
	`id` varchar(64) NOT NULL,
	`placeId` varchar(160) NOT NULL,
	`hospitalName` varchar(240) NOT NULL,
	`hospitalAddress` varchar(320) NOT NULL,
	`patientName` varchar(160) NOT NULL,
	`patientEmail` varchar(320),
	`patientPhone` varchar(40),
	`preferredDate` varchar(20) NOT NULL,
	`preferredTime` varchar(20) NOT NULL,
	`reason` text NOT NULL,
	`status` varchar(40) NOT NULL DEFAULT 'pending_hospital_confirmation',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hospitalAppointments_id` PRIMARY KEY(`id`)
);
