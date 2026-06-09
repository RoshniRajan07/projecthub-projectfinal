package com.example.demo.dto;

public class AdminAnalyticsDTO {

    private Long totalUsers;

    private Long totalProjects;

    private Long approvedProjects;

    private Long pendingProjects;

    private Long totalCertificates;

    private Long approvedCertificates;

    private Long pendingCertificates;

    private Long facultyCount;

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(
            Long totalUsers) {

        this.totalUsers =
                totalUsers;
    }

    public Long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(
            Long totalProjects) {

        this.totalProjects =
                totalProjects;
    }

    public Long getApprovedProjects() {
        return approvedProjects;
    }

    public void setApprovedProjects(
            Long approvedProjects) {

        this.approvedProjects =
                approvedProjects;
    }

    public Long getPendingProjects() {
        return pendingProjects;
    }

    public void setPendingProjects(
            Long pendingProjects) {

        this.pendingProjects =
                pendingProjects;
    }

    public Long getTotalCertificates() {
        return totalCertificates;
    }

    public void setTotalCertificates(
            Long totalCertificates) {

        this.totalCertificates =
                totalCertificates;
    }

    public Long getApprovedCertificates() {
        return approvedCertificates;
    }

    public void setApprovedCertificates(
            Long approvedCertificates) {

        this.approvedCertificates =
                approvedCertificates;
    }

    public Long getPendingCertificates() {
        return pendingCertificates;
    }

    public void setPendingCertificates(Long pendingCertificates) {
        this.pendingCertificates = pendingCertificates;
    }

    public Long getFacultyCount() {
        return facultyCount;
    }

    public void setFacultyCount(
            Long facultyCount) {

        this.facultyCount =
                facultyCount;
    }
}
