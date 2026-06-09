package com.example.demo.dto;

public class AuthResponse {

    private String token;
    private Long id;
    private String role;
    private String fullName;

    public AuthResponse(String token, Long id, String role, String fullName) {
        this.token = token;
        this.id = id;
        this.role = role;
        this.fullName = fullName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}
