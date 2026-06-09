package com.example.demo.dto;

public class DashboardDTO {

    private long totalProjects;

    private long approvedProjects;

    private long pendingProjects;

    private long verifiedCertificates;

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getApprovedProjects() {
        return approvedProjects;
    }

    public void setApprovedProjects(long approvedProjects) {
        this.approvedProjects = approvedProjects;
    }

    public long getPendingProjects() {
        return pendingProjects;
    }

    public void setPendingProjects(long pendingProjects) {
        this.pendingProjects = pendingProjects;
    }

    public long getVerifiedCertificates() {
        return verifiedCertificates;
    }

    public void setVerifiedCertificates(
            long verifiedCertificates) {

        this.verifiedCertificates =
                verifiedCertificates;
    }
}

