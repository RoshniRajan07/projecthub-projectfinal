package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String department;
    private String studentCode;
    private String section;
private String enrollmentYear;
    public String getStudentCode() {
		return studentCode;
	}

	public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getEnrollmentYear() {
        return enrollmentYear;
    }

    public void setEnrollmentYear(String enrollmentYear) {
        this.enrollmentYear = enrollmentYear;
    }

    public void setStudentCode(String studentCode) {
		this.studentCode = studentCode;
	}

	private String year;
    private String githubUrl;

    private String linkedinUrl;

    private String leetcodeUrl;

    private String hackerrankUrl;

    private String portfolioUrl;

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    @JsonIgnoreProperties({"user", "students"})
    private Faculty faculty;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password"})
    private User user;
   
    // GETTERS AND SETTERS

    public String getGithubUrl() {
		return githubUrl;
	}

	public void setGithubUrl(String githubUrl) {
		this.githubUrl = githubUrl;
	}

	public String getLinkedinUrl() {
		return linkedinUrl;
	}

	public void setLinkedinUrl(String linkedinUrl) {
		this.linkedinUrl = linkedinUrl;
	}

	public String getLeetcodeUrl() {
		return leetcodeUrl;
	}

	public void setLeetcodeUrl(String leetcodeUrl) {
		this.leetcodeUrl = leetcodeUrl;
	}

	public String getHackerrankUrl() {
		return hackerrankUrl;
	}

	public void setHackerrankUrl(String hackerrankUrl) {
		this.hackerrankUrl = hackerrankUrl;
	}

	public String getPortfolioUrl() {
		return portfolioUrl;
	}

	public void setPortfolioUrl(String portfolioUrl) {
		this.portfolioUrl = portfolioUrl;
	}

	public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public Faculty getFaculty() {
		return faculty;
	}

	public void setFaculty(Faculty faculty) {
		this.faculty = faculty;
	}

	public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}