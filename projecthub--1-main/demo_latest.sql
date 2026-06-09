-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: demo
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--


--
-- Table structure for table `admin_settings`
--

DROP TABLE IF EXISTS `admin_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `max_file_size` int DEFAULT NULL,
  `max_resubmissions` int DEFAULT NULL,
  `submission_deadline` varchar(255) DEFAULT NULL,
  `allowed_file_types` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_settings`
--

LOCK TABLES `admin_settings` WRITE;
/*!40000 ALTER TABLE `admin_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `access_level` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKpiovo1hsx7hi5f9ax85epqya9` (`user_id`),
  CONSTRAINT `FKgc8dtql9mkq268detxiox7fpm` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,NULL,1);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `allowed_file_types`
--

DROP TABLE IF EXISTS `allowed_file_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `allowed_file_types` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `settings_id` bigint DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `settings_id` (`settings_id`),
  CONSTRAINT `allowed_file_types_ibfk_1` FOREIGN KEY (`settings_id`) REFERENCES `admin_settings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allowed_file_types`
--

LOCK TABLES `allowed_file_types` WRITE;
/*!40000 ALTER TABLE `allowed_file_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `allowed_file_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action_title` varchar(255) DEFAULT NULL,
  `description` text,
  `performed_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FKonjalmr7kf8970g8gu7ymueer` (`performed_by`),
  CONSTRAINT `FKonjalmr7kf8970g8gu7ymueer` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'User Created','Created new user: Admin User',1,'2026-06-03 03:53:57'),(2,'User Created','Created new user: Faculty One',2,'2026-06-03 03:57:26'),(3,'User Created','Created new user: Faculty Two',3,'2026-06-03 03:58:02'),(4,'User Created','Created new user: Student One',4,'2026-06-03 03:59:03'),(5,'User Created','Created new user: Student Two',5,'2026-06-03 04:00:56'),(6,'User Created','Created new user: Student Three',6,'2026-06-03 04:01:39'),(8,'User Updated','Updated user: dr. arul',2,'2026-06-03 04:37:31'),(9,'User Updated','Updated user: ',2,'2026-06-03 04:50:22'),(10,'User Updated','Updated user: DR.Arul',2,'2026-06-03 05:18:13'),(11,'User Created','Created new user: student4',8,'2026-06-03 14:53:58'),(12,'User Created','Created new user: niranjani',9,'2026-06-04 07:01:47'),(13,'User Updated','Updated user: niranjani',9,'2026-06-04 07:01:47');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty`
--

DROP TABLE IF EXISTS `faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `department` varchar(255) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `faculty_code` varchar(255) DEFAULT NULL,
  `joining_year` varchar(255) DEFAULT NULL,
  `section` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK3eea1r6n844u6vn4qae7dix4` (`user_id`),
  CONSTRAINT `FKfakwwhqpm5bahy2do8t30j58r` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty`
--

LOCK TABLES `faculty` WRITE;
/*!40000 ALTER TABLE `faculty` DISABLE KEYS */;
INSERT INTO `faculty` VALUES (1,NULL,NULL,2,NULL,NULL,NULL),(2,NULL,NULL,3,NULL,NULL,NULL),(3,'',NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `faculty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `abstract_text` varchar(2000) DEFAULT NULL,
  `draft` bit(1) DEFAULT NULL,
  `feedback` varchar(2000) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `grade` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `submission_date` datetime(6) DEFAULT NULL,
  `technology` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `version_number` int DEFAULT NULL,
  `faculty_id` bigint DEFAULT NULL,
  `student_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKnk5gb84tc4271pocth8rx5sm3` (`faculty_id`),
  KEY `FKl1xvk23ld0d0ylvsv6jgrkdlx` (`student_id`),
  CONSTRAINT `FKl1xvk23ld0d0ylvsv6jgrkdlx` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKnk5gb84tc4271pocth8rx5sm3` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `department` varchar(255) DEFAULT NULL,
  `year` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `faculty_id` bigint DEFAULT NULL,
  `github_url` varchar(255) DEFAULT NULL,
  `hackerrank_url` varchar(255) DEFAULT NULL,
  `leetcode_url` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `portfolio_url` varchar(255) DEFAULT NULL,
  `student_code` varchar(255) DEFAULT NULL,
  `enrollment_year` varchar(255) DEFAULT NULL,
  `section` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKg4fwvutq09fjdlb4bb0byp7t` (`user_id`),
  KEY `FK472u8uhciyn9h12cykodmnd1` (`faculty_id`),
  CONSTRAINT `FK472u8uhciyn9h12cykodmnd1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`),
  CONSTRAINT `FKdt1cjx5ve5bdabmuuf3ibrwaq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'cst',NULL,4,NULL,'github.com/student','','','linkedin.com/in/student','','717823s157','2024','A'),(2,NULL,NULL,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,NULL,NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,NULL,NULL,8,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'cse',NULL,9,NULL,NULL,NULL,NULL,NULL,NULL,'717823s143','2024','A');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `assigned_subject` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@test.com','Admin User','$2a$10$VAHSo27DQkhtV5Xm2C2BX.B6fhmHb8DLL.ZCp31WmCeOYnOR/iKUq','ADMIN',NULL,NULL),(2,'faculty1@test.com','DR.Arul','$2a$10$1CuskN/qhqB2mXOPBYPnleRtCWgHbF8zqv007n0/T49XQRcJsdXCS','FACULTY',NULL,NULL),(3,'faculty2@test.com','Faculty Two','$2a$10$etUktpLShZHvW.HYNJs/Ku8n4/PkC0flK0D7V6cN1BxqVVAcGsvQa','FACULTY',NULL,NULL),(4,'student1@test.com','swathi','$2a$10$cGTminSRy/IzPJKZk1ggDerEB1Uhd4wUJIRPHZBLUvhListxmGtz6','STUDENT',NULL,NULL),(5,'student2@test.com','Student Two','$2a$10$KdmaFbVORWsTkfm3g.SU.Olww7s0m8ZMepB4aunvQVT8XJsZ6sKtq','STUDENT',NULL,NULL),(6,'student3@test.com','Student Three','$2a$10$3wQMOFAk82Cot5To5afKU.kN/DpV6Q49dQ2knd9P8uA52ZFjecGJO','STUDENT',NULL,NULL),(8,'student4@test.com','student4','$2a$10$fJVqQZyjFIiPwB9391CPU.tBCoKoe.PupUYbMXElDTzAo0BlfXZCi','STUDENT',NULL,NULL),(9,'student5@test.com','niranjani','$2a$10$kqvYaBcUedOjjvgC4754VetLj7L4/9762l4g7yzZo27VQGcJmWCL6','STUDENT',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-05 14:28:59
