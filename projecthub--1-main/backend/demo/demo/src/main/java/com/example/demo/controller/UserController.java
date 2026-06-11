package com.example.demo.controller;

import com.example.demo.entity.Student;
import com.example.demo.entity.Faculty;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;

import com.example.demo.entity.AdminSettings;
import com.example.demo.dto.AdminAnalyticsDTO;

import com.example.demo.entity.NotificationDocument;

import com.example.demo.entity.AuditLog;

import com.example.demo.dto.AuthRequest;

import com.example.demo.dto.AuthResponse;

@RestController
@RequestMapping("/users")
@CrossOrigin("*")

public class UserController {

    @Autowired
    private UserService userService;

    // LOGIN
    @PostMapping("/login")

    public AuthResponse login(

    		@RequestBody AuthRequest authRequest) {

    	return userService.login(authRequest);
    }

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@RequestBody Map<String, String> body) {
        return userService.requestStudentPasswordReset(body.get("email"));
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> body) {
        return userService.resetStudentPassword(
                body.get("token"),
                body.get("newPassword"),
                body.get("confirmPassword"));
    }

    
    // CREATE USER
    @PostMapping

    public User createUser(

            @RequestBody User user) {

        return userService.createUser(user);
    }

    // GET ALL USERS
    @GetMapping

    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }

    // GET USER BY ID
    @GetMapping("/{id}")

    public User getUserById(

            @PathVariable Long id) {

        return userService.getUserById(id);
    }

    // UPDATE USER
    @PutMapping("/{id}")

    public User updateUser(

            @PathVariable Long id,

            @RequestBody Map<String, Object> body) {

        return userService.updateUserWithProfile(id, body);
    }

    // DELETE USER
    @DeleteMapping("/{id}")

    public String deleteUser(

            @PathVariable Long id) {

        return userService.deleteUser(id);
    }

    // SEARCH USERS
    @GetMapping("/search")

    public List<User> searchUsers(

            @RequestParam String name) {

        return userService.searchUsers(name);
    }

    // FILTER USERS BY ROLE
    @GetMapping("/filter/role")

    public List<User> getUsersByRole(

            @RequestParam String role) {

        return userService.getUsersByRole(role);
    }

    // ASSIGN FACULTY
    @PutMapping("/assign-faculty/{id}")

    public User assignFaculty(

            @PathVariable Long id,

            @RequestParam String subject) {

        return userService.assignFaculty(id, subject);
    }

    // SAVE SETTINGS
    @PostMapping("/settings")

    public AdminSettings saveSettings(

            @RequestBody AdminSettings settings) {

        return userService.saveSettings(settings);
    }

    // GET SETTINGS
    @GetMapping("/settings")

    public List<AdminSettings> getAllSettings() {

        return userService.getAllSettings();
    }

    // ADMIN ANALYTICS
    @GetMapping("/admin/analytics")

    public AdminAnalyticsDTO getAdminAnalytics() {

        return userService.getAdminAnalytics();
    }

    // CREATE NOTIFICATION
    @PostMapping("/notifications")

    public NotificationDocument createNotification(

            @RequestBody
            NotificationDocument notification) {

        return userService.createNotification(notification);
    }

    // GET NOTIFICATIONS
    @GetMapping("/notifications/{userId}")

    public List<NotificationDocument> getNotifications(

            @PathVariable Long userId) {

        return userService.getNotifications(userId);
    }

    // MARK NOTIFICATION AS READ
    @PutMapping("/notifications/read/{id}")

    public NotificationDocument markAsRead(

            @PathVariable String id) {

        return userService.markNotificationAsRead(id);
    }

    // DELETE NOTIFICATION
    @DeleteMapping("/notifications/{id}")

    public String deleteNotification(

            @PathVariable String id) {

        return userService.deleteNotification(id);
    }

    // STUDENT PROFILE
    @GetMapping("/student/profile/{id}")

    public Student getStudentProfile(

            @PathVariable Long id) {

        return userService.getStudentProfile(id);
    }

    // UPDATE STUDENT PROFILE
    @PutMapping("/student/profile/{id}")

    public Student updateStudentProfile(

            @PathVariable Long id,

            @RequestBody java.util.Map<String, Object> body) {

        return userService.updateStudentProfileFromMap(id, body);
    }

    // FACULTY PROFILE
    @GetMapping("/faculty/profile/{id}")
    public Faculty getFacultyProfile(@PathVariable Long id) {
        return userService.getFacultyProfile(id);
    }

    // UPDATE FACULTY PROFILE
    @PutMapping("/faculty/profile/{id}")
    public Faculty updateFacultyProfile(@PathVariable Long id, @RequestBody java.util.Map<String, Object> body) {
        return userService.updateFacultyProfileFromMap(id, body);
    }

    // AUDIT LOGS
    @GetMapping("/audit-logs")

    public List<AuditLog> getAllAuditLogs() {

        return userService.getAllAuditLogs();
    }

    // BULK UPLOAD USERS FROM EXCEL
    @PostMapping("/bulk-upload")
    public Map<String, Object> bulkUploadUsers(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return userService.bulkRegisterFromExcel(file);
    }

    // FACULTY - GET ASSIGNED STUDENTS
    @GetMapping("/faculty/{facultyUserId}/students")
    public List<Student> getStudentsByFaculty(@PathVariable Long facultyUserId) {
        return userService.getStudentsByFacultyUserId(facultyUserId);
    }

    // ADMIN - ASSIGN STUDENT TO FACULTY
    @PutMapping("/admin/assign-student")
    public Student assignStudentToFaculty(@RequestParam Long studentUserId, @RequestParam Long facultyUserId) {
        return userService.assignStudentToFaculty(studentUserId, facultyUserId);
    }

    // ADMIN - UNASSIGN STUDENT FROM FACULTY
    @PutMapping("/admin/unassign-student")
    public Student unassignStudentFromFaculty(@RequestParam Long studentUserId) {
        return userService.unassignStudentFromFaculty(studentUserId);
    }

    // ADMIN - ASSIGN ALL STUDENTS OF A DEPARTMENT (AND OPTIONAL SECTION) TO FACULTY
    @PutMapping("/admin/assign-students-by-department")
    public List<Student> assignStudentsByDepartment(
            @RequestParam String department,
            @RequestParam(required = false) String section,
            @RequestParam Long facultyUserId) {
        return userService.assignStudentsByDepartment(department, section, facultyUserId);
    }

    // GET STUDENTS BY DEPARTMENT
    @GetMapping("/students/department/{department}")
    public List<Student> getStudentsByDepartment(@PathVariable String department) {
        return userService.getStudentsByDepartment(department);
    }
}
