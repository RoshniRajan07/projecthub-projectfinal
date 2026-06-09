package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.entity.CertificateDocument;

public interface CertificateMongoRepository
extends MongoRepository<CertificateDocument, String> {

    List<CertificateDocument>
    findByFacultyId(
            Integer facultyId);

    List<CertificateDocument>
    findByStudentId(
            Long studentId);
}