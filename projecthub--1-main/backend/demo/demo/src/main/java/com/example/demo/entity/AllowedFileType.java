package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "allowed_file_types")

public class AllowedFileType {

    @Id
    @GeneratedValue(strategy =
            GenerationType.IDENTITY)

    private Long id;

    private String fileType;

    @ManyToOne

    @JoinColumn(name = "settings_id")

    private AdminSettings adminSettings;

    public AllowedFileType() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(
            String fileType) {

        this.fileType = fileType;
    }

    public AdminSettings
    getAdminSettings() {

        return adminSettings;
    }

    public void setAdminSettings(
            AdminSettings adminSettings) {

        this.adminSettings =
                adminSettings;
    }
}