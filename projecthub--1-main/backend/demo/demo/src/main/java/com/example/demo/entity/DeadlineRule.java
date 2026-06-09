package com.example.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "deadline_rules")
public class DeadlineRule {

    @Id
    private String id;

    private String type;          // "Project" or "Certificate"

    private String name;          // e.g., "Machine Learning", "Cloud"

    private String deadline;      // ISO date e.g., "2026-06-15"

    private int resubmissions;    // max allowed resubmissions

    private String status;        // "Active" or "Inactive"

    public DeadlineRule() {
    }

    // GETTERS & SETTERS

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public int getResubmissions() {
        return resubmissions;
    }

    public void setResubmissions(int resubmissions) {
        this.resubmissions = resubmissions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}