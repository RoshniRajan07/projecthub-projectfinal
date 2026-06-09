package com.example.demo.controller;

import java.util.List;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.User;
import com.example.demo.entity.ProjectDocument;
import com.example.demo.entity.CertificateDocument;

import com.example.demo.service.UserService;
import com.example.demo.service.ProjectService;

@RestController
@RequestMapping("/admin")
@CrossOrigin("*")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProjectService projectService;

    @GetMapping("/users")
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }

    @DeleteMapping("/users/{id}")
    public String deleteUser(
            @PathVariable Long id) {

        return userService.deleteUser(id);
    }

    @GetMapping("/projects")
    public List<ProjectDocument> getAllProjects() {

        return projectService.getAllProjects();
    }

    @GetMapping("/certificates")
    public List<CertificateDocument> getAllCertificates() {

        return projectService.getAllCertificates();
    }

    // DASHBOARD ANALYTICS
    @GetMapping("/dashboard")
    public Map<String, Long> getDashboardData() {

        return projectService.getDashboardData();
    }
}