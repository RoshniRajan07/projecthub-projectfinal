package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.entity.NotificationDocument;

public interface NotificationMongoRepository
extends MongoRepository<NotificationDocument, String> {

    List<NotificationDocument>
    findByUserId(
            Long userId);

    boolean existsByUserIdAndTitleAndMessage(
            Long userId,
            String title,
            String message);
}
