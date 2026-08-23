CREATE TABLE `article_document_meta` (
	`article_id` bigint NOT NULL,
	`source_key` varchar(191) NOT NULL,
	`reading_minutes` int NOT NULL DEFAULT 1,
	`featured` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `article_document_meta_article_id` PRIMARY KEY(`article_id`),
	CONSTRAINT `uk_article_document_meta_source` UNIQUE(`source_key`)
);
