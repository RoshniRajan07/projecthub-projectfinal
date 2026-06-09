package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.AdminSettings;

public interface AdminSettingsRepository
extends JpaRepository<AdminSettings, Long> {

}
