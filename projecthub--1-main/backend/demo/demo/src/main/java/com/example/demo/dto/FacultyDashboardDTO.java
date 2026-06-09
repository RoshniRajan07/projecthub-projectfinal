package com.example.demo.dto;

public class FacultyDashboardDTO {

    private long assignedProjects;

    private long pendingReviews;

    private long approvedProjects;

    private long certificatesToVerify;

    public long getAssignedProjects() {
        return assignedProjects;
    }

    public void setAssignedProjects(
            long assignedProjects) {

        this.assignedProjects =
                assignedProjects;
    }

    public long getPendingReviews() {
        return pendingReviews;
    }

    public void setPendingReviews(
            long pendingReviews) {

        this.pendingReviews =
                pendingReviews;
    }

    public long getApprovedProjects() {
        return approvedProjects;
    }

    public void setApprovedProjects(
            long approvedProjects) {

        this.approvedProjects =
                approvedProjects;
    }

    public long getCertificatesToVerify() {
        return certificatesToVerify;
    }

    public void setCertificatesToVerify(
            long certificatesToVerify) {

        this.certificatesToVerify =
                certificatesToVerify;
    }
}
