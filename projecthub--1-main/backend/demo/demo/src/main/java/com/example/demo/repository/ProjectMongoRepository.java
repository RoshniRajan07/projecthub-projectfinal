package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.
MongoRepository;

import com.example.demo.entity.ProjectDocument;

public interface ProjectMongoRepository
extends MongoRepository<ProjectDocument, String> {

    List<ProjectDocument>
    findByStudentId(Long studentId);

    List<ProjectDocument>
    findByFacultyId(Long facultyId);

    List<ProjectDocument>
    findByStatus(String status);
    
   

    List<ProjectDocument>
    findByTitleContainingIgnoreCase(
            String title);

    List<ProjectDocument>
    findByTechnologyContainingIgnoreCase(
            String technology);

    List<ProjectDocument>
    findByStatusAndTechnologyContainingIgnoreCase(
            String status,
            String technology);
} 