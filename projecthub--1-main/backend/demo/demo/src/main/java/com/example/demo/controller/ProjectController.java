package com.example.demo.controller;

import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

import com.example.demo.dto.StudentAnalyticsDTO;
import com.example.demo.entity.ProjectDocument;
import com.example.demo.service.ProjectService;

@RestController
@RequestMapping("/projects")
@CrossOrigin("*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    // =====================================
    // FILE UPLOAD
    // =====================================

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
            java.nio.file.Files.createDirectories(uploadPath);
            String fileName = System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
            Path targetLocation = uploadPath.resolve(fileName);
            java.nio.file.Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok(fileName);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not store file");
        }
    }

    // =====================================
    // FILE DOWNLOAD
    // =====================================

    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileName,
            @RequestParam(value = "inline", required = false) Boolean inline) {
        try {
            Path filePath = Paths.get("uploads").toAbsolutePath().normalize().resolve(fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "application/octet-stream";
            if (fileName.toLowerCase().endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (fileName.toLowerCase().endsWith(".png")) {
                contentType = "image/png";
            } else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) {
                contentType = "image/jpeg";
            }

            String disposition = Boolean.TRUE.equals(inline)
                    ? "inline; filename=\"" + resource.getFilename() + "\""
                    : "attachment; filename=\"" + resource.getFilename() + "\"";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                    .body(resource);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =====================================
    // MONGODB PROJECT CRUD
    // =====================================

    @PostMapping("/mongo")
    public ProjectDocument createMongoProject(@Valid @RequestBody ProjectDocument project) {
        return projectService.createMongoProject(project);
    }

    @GetMapping("/mongo")
    public List<ProjectDocument> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/mongo/student/{studentId}")
    public List<ProjectDocument> getMongoProjectsByStudent(@PathVariable Long studentId) {
        return projectService.getMongoProjectsByStudent(studentId);
    }

    @GetMapping("/mongo/faculty/{facultyId}")
    public List<ProjectDocument> getMongoFacultyProjects(@PathVariable Long facultyId) {
        return projectService.getMongoFacultyProjects(facultyId);
    }

    @GetMapping("/mongo/{id}")
    public ProjectDocument getMongoProjectById(@PathVariable String id) {
        return projectService.getMongoProjectById(id);
    }

    @PutMapping("/mongo/review/{id}")
    public ProjectDocument reviewMongoProject(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam String feedback,
            @RequestParam String grade) {
        return projectService.reviewMongoProject(id, status, feedback, grade);
    }

    @PutMapping("/mongo/update/{id}")
    public ProjectDocument updateMongoProject(
            @PathVariable String id,
            @Valid @RequestBody ProjectDocument project) {
        return projectService.updateMongoProject(id, project);
    }

    @PutMapping("/mongo/resubmit/{id}")
    public ProjectDocument resubmitMongoProject(@PathVariable String id) {
        return projectService.resubmitProject(id);
    }

    @DeleteMapping("/mongo/{id}")
    public ResponseEntity<String> deleteMongoProject(@PathVariable String id) {
        projectService.deleteMongoProject(id);
        return ResponseEntity.ok("Project deleted");
    }

    // =====================================
    // SEARCH & FILTER
    // =====================================

    @GetMapping("/mongo/search")
    public List<ProjectDocument> searchProjects(@RequestParam String title) {
        return projectService.searchProjectsByTitle(title);
    }

    @GetMapping("/mongo/filter/status")
    public List<ProjectDocument> filterProjectsByStatus(@RequestParam String status) {
        return projectService.filterProjectsByStatus(status);
    }

    @GetMapping("/mongo/filter/technology")
    public List<ProjectDocument> filterProjectsByTechnology(@RequestParam String technology) {
        return projectService.filterProjectsByTechnology(technology);
    }

    @GetMapping("/mongo/filter")
    public List<ProjectDocument> filterProjects(
            @RequestParam String status,
            @RequestParam String technology) {
        return projectService.filterProjects(status, technology);
    }

    // =====================================
    // STUDENT ANALYTICS
    // =====================================

    @GetMapping("/analytics/student/{studentId}")
    public StudentAnalyticsDTO getStudentAnalytics(@PathVariable Long studentId) {
        return projectService.getStudentAnalytics(studentId);
    }
}