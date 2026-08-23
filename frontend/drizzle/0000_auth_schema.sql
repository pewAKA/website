CREATE TABLE IF NOT EXISTS `auth_account` (
	`id` varchar(36) NOT NULL,
	`issuer` varchar(191) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(64) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` datetime,
	`refresh_token_expires_at` datetime,
	`scope` text,
	`password` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `auth_account_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_auth_account_issuer` UNIQUE(`issuer`,`account_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `auth_session` (
	`id` varchar(36) NOT NULL,
	`expires_at` datetime NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`ip_address` varchar(64),
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` varchar(36),
	CONSTRAINT `auth_session_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_auth_session_token` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `auth_user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` varchar(500),
	`username` varchar(64),
	`role` varchar(32) NOT NULL DEFAULT 'user',
	`banned` boolean NOT NULL DEFAULT false,
	`ban_reason` varchar(255),
	`ban_expires` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `auth_user_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_auth_user_email` UNIQUE(`email`),
	CONSTRAINT `uk_auth_user_username` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `auth_verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `auth_verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_auth_account_user` ON `auth_account` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_auth_session_user` ON `auth_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_auth_verification_identifier` ON `auth_verification` (`identifier`);
