package com.example.demo.dto;

public class StudentAnalyticsDTO {

    private long totalProjects;

    private long approvedProjects;

    private long pendingProjects;

    private long rejectedProjects;

    // GETTERS & SETTERS

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(
            long totalProjects) {

        this.totalProjects =
                totalProjects;
    }

    public long getApprovedProjects() {
        return approvedProjects;
    }

    public void setApprovedProjects(
            long approvedProjects) {

        this.approvedProjects =
                approvedProjects;
    }

    public long getPendingProjects() {
        return pendingProjects;
    }

    public void setPendingProjects(
            long pendingProjects) {

        this.pendingProjects =
                pendingProjects;
    }

    public long getRejectedProjects() {
        return rejectedProjects;
    }

    public void setRejectedProjects(
            long rejectedProjects) {

        this.rejectedProjects =
                rejectedProjects;
    }
}
