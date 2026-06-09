package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.User;

public interface UserRepository
extends JpaRepository<User, Long> {

    Optional<User>
    findByEmail(String email);

    List<User>
    findByRole(String role);

    List<User>
    findByFullNameContainingIgnoreCase(
            String fullName);
    boolean existsByEmail(String email);
}