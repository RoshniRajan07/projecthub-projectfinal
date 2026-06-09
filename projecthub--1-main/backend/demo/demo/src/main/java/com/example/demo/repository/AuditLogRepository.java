package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.AuditLog;
import com.example.demo.entity.User;

public interface AuditLogRepository
extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByPerformedBy(User user);
    void deleteByPerformedBy(User user);
}
