package com.example.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
@Entity
@Table(name = "audit_logs")

public class AuditLog {

    @Id
    @GeneratedValue(
            strategy =
            GenerationType.IDENTITY)

    private Long id;

    private String actionTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne

    @JoinColumn(name = "performed_by")

    private User performedBy;
    

    private LocalDateTime createdAt;

    public AuditLog() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActionTitle() {
        return actionTitle;
    }

    public void setActionTitle(
            String actionTitle) {

        this.actionTitle =
                actionTitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description) {

        this.description =
                description;
    }

   

    public User getPerformedBy() {
		return performedBy;
	}

	public void setPerformedBy(User performedBy) {
		this.performedBy = performedBy;
	}

	public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt =
                createdAt;
    }
}
