package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.CertificateDocument;
import com.example.demo.service.ProjectService;

@RestController
@RequestMapping("/certificates")
@CrossOrigin("*")
public class CertificateController {

    @Autowired
    private ProjectService projectService;

    // CREATE CERTIFICATE
    @PostMapping
    public CertificateDocument createCertificate(@RequestBody CertificateDocument certificate) {
        return projectService.createMongoCertificate(certificate);
    }

    // GET ALL CERTIFICATES
    @GetMapping
    public List<CertificateDocument> getAllCertificates() {
        return projectService.getAllCertificates();
    }

    // GET CERTIFICATES BY STUDENT
    @GetMapping("/student/{studentId}")
    public List<CertificateDocument> getCertificatesByStudent(@PathVariable Long studentId) {
        return projectService.getCertificatesByStudent(studentId);
    }

    // GET CERTIFICATES BY FACULTY
    @GetMapping("/faculty/{facultyId}")
    public List<CertificateDocument> getCertificatesByFaculty(@PathVariable Integer facultyId) {
        return projectService.getCertificatesByFaculty(facultyId);
    }

    // VERIFY CERTIFICATE (approve/reject)
    @PutMapping("/{id}/verify")
    public CertificateDocument verifyCertificate(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam String remarks) {
        return projectService.verifyCertificate(id, status, remarks);
    }

    // EDIT / UPDATE CERTIFICATE
    @PutMapping("/{id}")
    public CertificateDocument updateCertificate(
            @PathVariable String id,
            @RequestBody CertificateDocument certificate) {
        return projectService.updateCertificate(id, certificate);
    }

    // RESUBMIT CERTIFICATE
    @PutMapping("/{id}/resubmit")
    public CertificateDocument resubmitCertificate(@PathVariable String id) {
        return projectService.resubmitCertificate(id);
    }

    // DELETE CERTIFICATE
    @DeleteMapping("/{id}")
    public String deleteCertificate(@PathVariable String id) {
        return projectService.deleteCertificate(id);
    }
}