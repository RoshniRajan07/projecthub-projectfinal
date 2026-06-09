package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
public class AdminSettings {

    @Id
    @GeneratedValue(strategy =
            GenerationType.IDENTITY)

    private Long id;

    private String submissionDeadline;

    private Integer maxResubmissions;

    private Integer maxFileSize;

    private String allowedFileTypes;

    public AdminSettings() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSubmissionDeadline() {
        return submissionDeadline;
    }

    public void setSubmissionDeadline(
            String submissionDeadline) {

        this.submissionDeadline =
                submissionDeadline;
    }

    public Integer getMaxResubmissions() {
        return maxResubmissions;
    }

    public void setMaxResubmissions(
            Integer maxResubmissions) {

        this.maxResubmissions =
                maxResubmissions;
    }

    public Integer getMaxFileSize() {
        return maxFileSize;
    }

    public void setMaxFileSize(
            Integer maxFileSize) {

        this.maxFileSize =
                maxFileSize;
    }

    public String getAllowedFileTypes() {
        return allowedFileTypes;
    }

    public void setAllowedFileTypes(
            String allowedFileTypes) {

        this.allowedFileTypes =
                allowedFileTypes;
    }
}
