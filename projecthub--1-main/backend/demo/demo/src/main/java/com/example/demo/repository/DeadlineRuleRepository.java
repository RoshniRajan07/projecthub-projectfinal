package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.entity.DeadlineRule;

public interface DeadlineRuleRepository extends MongoRepository<DeadlineRule, String> {

    List<DeadlineRule> findByType(String type);

    Optional<DeadlineRule> findByTypeAndName(String type, String name);

    List<DeadlineRule> findByStatus(String status);
}
