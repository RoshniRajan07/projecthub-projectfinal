package com.example.demo.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.io.IOException;
import java.nio.file.DirectoryStream;
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
            String cleanFileName = StringUtils.cleanPath(fileName);
            Path filePath = findDownloadPath(cleanFileName);
            if (filePath == null) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = getContentType(resource.getFilename());

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

    private Path findDownloadPath(String fileName) {
        String publicFileName = stripTimestampPrefix(fileName);
        Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        Path nestedUploadPath = Paths.get("backend", "demo", "demo", "uploads").toAbsolutePath().normalize();
        Path rootPublicPath = Paths.get("frontend", "projecthub", "front", "public").toAbsolutePath().normalize();
        Path backendToPublicPath = Paths.get("..", "..", "..", "frontend", "projecthub", "front", "public").toAbsolutePath().normalize();
        Path[] candidates = new Path[] {
                uploadPath.resolve(fileName),
                nestedUploadPath.resolve(fileName),
                rootPublicPath.resolve(fileName),
                rootPublicPath.resolve(publicFileName),
                backendToPublicPath.resolve(publicFileName)
        };

        for (Path candidate : candidates) {
            if (Files.exists(candidate) && Files.isRegularFile(candidate)) {
                return candidate;
            }
        }

        Path[] searchDirectories = new Path[] {
                uploadPath,
                nestedUploadPath,
                rootPublicPath,
                backendToPublicPath
        };

        for (Path directory : searchDirectories) {
            Path fuzzyMatch = findSimilarFile(directory, publicFileName);
            if (fuzzyMatch != null) {
                return fuzzyMatch;
            }
        }
        return null;
    }

    private String stripTimestampPrefix(String fileName) {
        return fileName.replaceFirst("^(\\d+_)+", "");
    }

    private Path findSimilarFile(Path directory, String requestedFileName) {
        if (!Files.isDirectory(directory)) {
            return null;
        }

        String requestedBase = normalizeBaseName(requestedFileName);
        if (requestedBase.length() < 3) {
            return null;
        }

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(directory)) {
            for (Path file : stream) {
                if (!Files.isRegularFile(file)) {
                    continue;
                }
                String candidateBase = normalizeBaseName(stripTimestampPrefix(file.getFileName().toString()));
                if (candidateBase.contains(requestedBase) || requestedBase.contains(candidateBase)) {
                    return file;
                }
            }
        } catch (IOException ignored) {
            return null;
        }
        return null;
    }

    private String normalizeBaseName(String fileName) {
        String nameWithoutExtension = fileName.replaceFirst("\\.[^.]+$", "");
        return nameWithoutExtension.toLowerCase().replaceAll("[^a-z0-9]+", "");
    }

    private String getContentType(String fileName) {
        String lowerName = fileName == null ? "" : fileName.toLowerCase();
        if (lowerName.endsWith(".pdf")) {
            return "application/pdf";
        }
        if (lowerName.endsWith(".png")) {
            return "image/png";
        }
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lowerName.endsWith(".doc")) {
            return "application/msword";
        }
        if (lowerName.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }
        if (lowerName.endsWith(".zip")) {
            return "application/zip";
        }
        return "application/octet-stream";
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
