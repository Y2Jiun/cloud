-- Database Export for AWS RDS Migration
-- Generated on: 2025-08-16T13:26:46.509Z

SET FOREIGN_KEY_CHECKS = 0;

-- Table: _prisma_migrations
DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table: _prisma_migrations
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('a32ec4cc-2224-45be-aac8-37850cfec1a1', '21062c090a7a1960084135dd60462f9f405f71cca519baa8cc8fcfdea40585b6', '2025-08-15 10:05:00', '20250815180500_init', NULL, NULL, '2025-08-15 10:05:00', 1);

-- Table: activities
DROP TABLE IF EXISTS `activities`;
CREATE TABLE `activities` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customerId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table: activities
INSERT INTO `activities` (`id`, `type`, `description`, `timestamp`, `userId`, `customerId`, `metadata`) VALUES
('cmed54sp50005w2m8x7jicfog', 'user_registered', 'New user registered: Demo User', '2025-08-15 10:07:25', '2', NULL, NULL),
('cmed54spa0006w2m8pzku7d6e', 'customer_created', 'New customer added: John Smith', '2025-08-15 10:07:25', NULL, NULL, NULL),
('cmed54spd0007w2m8is12hbzf', 'customer_created', 'New customer added: Sarah Johnson', '2025-08-15 10:07:25', NULL, NULL, NULL);

-- Table: customers
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table: customers
INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `avatar`, `address`, `createdAt`, `updatedAt`) VALUES
('cmed54sol0000w2m8cwsncyvt', 'John Smith', 'john.smith@example.com', '+1-555-0123', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', '{"city":"New York","state":"NY","street":"123 Main St","country":"USA","zipCode":"10001"}', '2025-08-15 10:07:24', '2025-08-15 10:07:24'),
('cmed54sor0001w2m80w3hqr7w', 'Sarah Johnson', 'sarah.johnson@example.com', '+1-555-0124', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', '{"city":"Los Angeles","state":"CA","street":"456 Oak Ave","country":"USA","zipCode":"90210"}', '2025-08-15 10:07:24', '2025-08-15 10:07:24'),
('cmed54sov0002w2m87sj6yyrl', 'Michael Brown', 'michael.brown@example.com', '+1-555-0125', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', '{"city":"Chicago","state":"IL","street":"789 Pine St","country":"USA","zipCode":"60601"}', '2025-08-15 10:07:24', '2025-08-15 10:07:24'),
('cmed54soy0003w2m8ukkq1ivo', 'Emily Davis', 'emily.davis@example.com', '+1-555-0126', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', '{"city":"Houston","state":"TX","street":"321 Elm St","country":"USA","zipCode":"77001"}', '2025-08-15 10:07:24', '2025-08-15 10:07:24'),
('cmed54sp10004w2m8rxqqnx4c', 'David Wilson', 'david.wilson@example.com', '+1-555-0127', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', '{"city":"Phoenix","state":"AZ","street":"654 Maple Ave","country":"USA","zipCode":"85001"}', '2025-08-15 10:07:24', '2025-08-15 10:07:24');

-- Table: password_reset_otps
DROP TABLE IF EXISTS `password_reset_otps`;
CREATE TABLE `password_reset_otps` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table: password_reset_otps
INSERT INTO `password_reset_otps` (`id`, `email`, `otp`, `token`, `expiresAt`, `verified`, `createdAt`, `updatedAt`) VALUES
('cmednsy9q0000w2tsso3ri2il', 'yapjiun123004@gmail.com', '233922', NULL, '2025-08-15 18:51:05', 0, '2025-08-15 18:50:05', '2025-08-15 18:50:05');

-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userid` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profilepic` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `roles` int NOT NULL DEFAULT '3',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `last_login` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `users_username_key` (`username`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table: users
INSERT INTO `users` (`userid`, `username`, `name`, `email`, `password`, `profilepic`, `contact`, `roles`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'admin', NULL, 'admin@example.com', '$2b$12$WZVnaR4AD3h7acMMOUjvMu53DbmgnLxxUSKs2cVXUSJdgVhBYijN2', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', NULL, 3, '2025-08-15 10:07:24', '2025-08-15 10:07:24', NULL),
(2, 'demo', NULL, 'demo@example.com', '$2b$12$6GPsg.NlSNkbv2YAf1sttukV1FCwsZYHt1O2pK5FrQKKW5/4V7mu.', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', NULL, 3, '2025-08-15 10:07:24', '2025-08-15 10:07:24', NULL),
(3, 'yapjiun', 'yap jiun', 'email@gmail.com', '$2b$12$DRlgwndRygtMTu0yWFvAGu78Go1tb0QQYphAwa0Zh.LnEaRjY/JYK', NULL, NULL, 3, '2025-08-15 10:34:16', '2025-08-15 10:37:39', '2025-08-15 10:37:39'),
(4, 'derrickyap', 'derrick yap', 'yapjiun123004@gmail.com', '$2b$12$.SnumWFk2B4rZOxj7pxq0et/DrPjECQPFKseautaFNxE63fl1WYnS', 'https://res.cloudinary.com/dvl5whm1n/image/upload/v1755310906/dashboard-app/bbjn62ks02v4mwdelrhk.jpg', '127155295', 1, '2025-08-15 10:39:03', '2025-08-16 00:48:24', '2025-08-16 00:48:24'),
(5, 'yosup', 'yo sup', 'username123@yahoo.com', '$2b$12$fJL9iProWtJuagq1YrIQselvVUpNFKLHj4PM0IqiN77x.MYb2YFtm', NULL, NULL, 3, '2025-08-15 10:45:11', '2025-08-15 10:45:11', NULL);

SET FOREIGN_KEY_CHECKS = 1;
