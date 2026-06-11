package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.User;

public interface UserRepository
extends JpaRepository<User, Long> {

    Optional<User>
    findByEmail(String email);

    @Query("select u from User u where lower(trim(u.email)) = lower(trim(:email))")
    Optional<User>
    findByEmailNormalized(@Param("email") String email);

    List<User>
    findByRole(String role);

    List<User>
    findByFullNameContainingIgnoreCase(
            String fullName);
    boolean existsByEmail(String email);
}
