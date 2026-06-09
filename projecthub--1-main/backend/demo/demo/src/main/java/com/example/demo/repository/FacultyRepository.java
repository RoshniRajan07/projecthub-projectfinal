package com.example.demo.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Faculty;

public interface FacultyRepository
        extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByUserId(Long userId);
}