package com.example.demo.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.AdminAnalyticsDTO;
import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;

import com.example.demo.entity.Admin;
import com.example.demo.entity.AdminSettings;
import com.example.demo.entity.AuditLog;
import com.example.demo.entity.Faculty;
import com.example.demo.entity.NotificationDocument;
import com.example.demo.entity.Student;
import com.example.demo.entity.User;

import com.example.demo.repository.AdminRepository;
import com.example.demo.repository.AdminSettingsRepository;
import com.example.demo.repository.AuditLogRepository;

import com.example.demo.repository.FacultyRepository;
import com.example.demo.repository.NotificationMongoRepository;

import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.ProjectMongoRepository;
import com.example.demo.repository.CertificateMongoRepository;
import com.example.demo.security.JWTUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private static final String ENCRYPTED_PASSWORD_PREFIX = "enc:v2:";
    private static final String LOGIN_ENCRYPTION_KEY = "ProjectHubLoginKey2026AESKey1234";
    private final Set<Long> adminNotificationSyncs = ConcurrentHashMap.newKeySet();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private AdminSettingsRepository adminSettingsRepository;

    @Autowired
    private ProjectMongoRepository projectMongoRepository;

    @Autowired
    private CertificateMongoRepository certificateMongoRepository;

    @Autowired
    private NotificationMongoRepository notificationMongoRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JWTUtil jwtUtil;

    // =========================================
    // STUDENT PROFILE
    // =========================================

    public Student getStudentProfile(Long id) {
        return studentRepository.findByUserId(id).orElseThrow();
    }

    public Student updateStudentProfile(Long id, Student updatedStudent) {

        Student student = studentRepository.findByUserId(id).orElseThrow();

        // Update user fields (name, email)
        if (updatedStudent.getUser() != null) {
            User user = student.getUser();
            if (updatedStudent.getUser().getFullName() != null) {
                user.setFullName(updatedStudent.getUser().getFullName());
            }
            if (updatedStudent.getUser().getEmail() != null) {
                user.setEmail(updatedStudent.getUser().getEmail());
            }
            userRepository.save(user);
        }

        // Update student fields
        if (updatedStudent.getDepartment() != null) student.setDepartment(updatedStudent.getDepartment());
        if (updatedStudent.getSection() != null) student.setSection(updatedStudent.getSection());
        if (updatedStudent.getEnrollmentYear() != null) student.setEnrollmentYear(updatedStudent.getEnrollmentYear());

        student.setGithubUrl(updatedStudent.getGithubUrl());
        student.setLinkedinUrl(updatedStudent.getLinkedinUrl());
        student.setLeetcodeUrl(updatedStudent.getLeetcodeUrl());
        student.setHackerrankUrl(updatedStudent.getHackerrankUrl());
        student.setPortfolioUrl(updatedStudent.getPortfolioUrl());

        return studentRepository.save(student);
    }

    @SuppressWarnings("unchecked")
    public Student updateStudentProfileFromMap(Long id, java.util.Map<String, Object> body) {

        Student student = studentRepository.findByUserId(id).orElseThrow();

        // Update user fields (name, email)
        Object userObj = body.get("user");
        if (userObj instanceof java.util.Map) {
            java.util.Map<String, Object> userMap = (java.util.Map<String, Object>) userObj;
            User user = student.getUser();
            if (userMap.get("fullName") != null) {
                user.setFullName((String) userMap.get("fullName"));
            }
            if (userMap.get("email") != null) {
                user.setEmail((String) userMap.get("email"));
            }
            userRepository.save(user);
        }

        // Update student fields
        if (body.get("department") != null) student.setDepartment((String) body.get("department"));
        if (body.get("section") != null) student.setSection((String) body.get("section"));
        if (body.get("enrollmentYear") != null) student.setEnrollmentYear((String) body.get("enrollmentYear"));
        if (body.get("studentCode") != null) student.setStudentCode((String) body.get("studentCode"));

        student.setGithubUrl((String) body.get("githubUrl"));
        student.setLinkedinUrl((String) body.get("linkedinUrl"));
        student.setLeetcodeUrl((String) body.get("leetcodeUrl"));
        student.setHackerrankUrl((String) body.get("hackerrankUrl"));
        student.setPortfolioUrl((String) body.get("portfolioUrl"));

        return studentRepository.save(student);
    }

    // =========================================
    // FACULTY PROFILE
    // =========================================

    public Faculty getFacultyProfile(Long userId) {
        Optional<Faculty> faculty = facultyRepository.findByUserId(userId);
        if (faculty.isPresent()) {
            return faculty.get();
        }
        // Auto-create faculty record if not exists
        User user = userRepository.findById(userId).orElseThrow();
        Faculty newFaculty = new Faculty();
        newFaculty.setUser(user);
        newFaculty.setDepartment("");
        return facultyRepository.save(newFaculty);
    }

    @SuppressWarnings("unchecked")
    public Faculty updateFacultyProfileFromMap(Long userId, java.util.Map<String, Object> body) {
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    Faculty f = new Faculty();
                    f.setUser(user);
                    return f;
                });

        // Update user fields (name, email)
        Object userObj = body.get("user");
        if (userObj instanceof java.util.Map) {
            java.util.Map<String, Object> userMap = (java.util.Map<String, Object>) userObj;
            User user = faculty.getUser();
            if (userMap.get("fullName") != null) {
                user.setFullName((String) userMap.get("fullName"));
            }
            if (userMap.get("email") != null) {
                user.setEmail((String) userMap.get("email"));
            }
            userRepository.save(user);
        }

        // Update faculty fields
        if (body.get("department") != null) faculty.setDepartment((String) body.get("department"));
        if (body.get("section") != null) faculty.setSection((String) body.get("section"));
        if (body.get("joiningYear") != null) faculty.setJoiningYear((String) body.get("joiningYear"));
        if (body.get("facultyCode") != null) faculty.setFacultyCode((String) body.get("facultyCode"));
        if (body.get("specialization") != null) faculty.setSpecialization((String) body.get("specialization"));

        return facultyRepository.save(faculty);
    }

    // =========================================
    // REGISTER
    // =========================================

    public User register(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already registered"
            );
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("STUDENT");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);

        saveAuditLog(
                "User Created",
                "Created new user: " + user.getFullName(),
                savedUser.getId()
        );

        if ("STUDENT".equals(savedUser.getRole())) {
            Student student = new Student();
            student.setUser(savedUser);
            studentRepository.save(student);

        } else if ("FACULTY".equals(savedUser.getRole())) {
            Faculty faculty = new Faculty();
            faculty.setUser(savedUser);
            facultyRepository.save(faculty);

        } else if ("ADMIN".equals(savedUser.getRole())) {
            Admin admin = new Admin();
            admin.setUser(savedUser);
            adminRepository.save(admin);
        }

        return savedUser;
    }

    // =========================================
    // LOGIN (returns JWT string)
    // =========================================

    public String login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        String loginPassword = decryptLoginPassword(request.getPassword());

        if (!passwordEncoder.matches(loginPassword, user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        return jwtUtil.generateToken(user.getEmail(), user.getRole());
    }

    // =========================================
    // CREATE USER
    // =========================================

    public User createUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already registered"
            );
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);

        saveAuditLog(
                "User Created",
                "Created user: " + user.getFullName(),
                savedUser.getId()
        );

        return savedUser;
    }

    // =========================================
    // GET ALL USERS
    // =========================================

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // =========================================
    // GET USER BY ID
    // =========================================

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow();
    }

    // =========================================
    // DELETE USER
    // =========================================

    @Transactional
    public String deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            return "User Not Found";
        }

        User user = userRepository.findById(id).orElse(null);

        // Delete audit logs referencing this user
        List<AuditLog> auditLogs = auditLogRepository.findByPerformedBy(user);
        auditLogRepository.deleteAll(auditLogs);

        // Delete related child records first to avoid FK constraint errors
        Optional<Student> student = studentRepository.findByUserId(id);
        student.ifPresent(s -> studentRepository.delete(s));

        Optional<Faculty> faculty = facultyRepository.findByUserId(id);
        if (faculty.isPresent()) {
            // Unlink students assigned to this faculty
            List<Student> assignedStudents = studentRepository.findByFacultyId(faculty.get().getId());
            for (Student s : assignedStudents) {
                s.setFaculty(null);
                studentRepository.save(s);
            }
            facultyRepository.delete(faculty.get());
        }

        // Delete admin record if exists
        Optional<Admin> admin = adminRepository.findByUserId(id);
        admin.ifPresent(a -> adminRepository.delete(a));

        userRepository.deleteById(id);

        return "User Deleted Successfully";
    }

    // =========================================
    // UPDATE USER
    // =========================================

    public User updateUser(Long id, User updatedUser) {

        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        user.setFullName(updatedUser.getFullName());
        user.setEmail(updatedUser.getEmail());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        user.setRole(updatedUser.getRole());
        user.setUsername(updatedUser.getUsername());

        User updated = userRepository.save(user);

        saveAuditLog(
                "User Updated",
                "Updated user: " + user.getFullName(),
                updated.getId()
        );

        return updated;
    }

    // =========================================
    // UPDATE USER WITH PROFILE FIELDS (from admin edit)
    // =========================================
    public User updateUserWithProfile(Long id, java.util.Map<String, Object> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (body.containsKey("fullName")) user.setFullName((String) body.get("fullName"));
        if (body.containsKey("email")) user.setEmail((String) body.get("email"));
        if (body.containsKey("role")) user.setRole((String) body.get("role"));

        User updated = userRepository.save(user);

        // Update student-specific fields
        if ("STUDENT".equals(updated.getRole())) {
            Student student = studentRepository.findByUserId(updated.getId()).orElse(null);
            if (student != null) {
                if (body.containsKey("department")) student.setDepartment((String) body.get("department"));
                if (body.containsKey("section")) student.setSection((String) body.get("section"));
                if (body.containsKey("studentCode")) student.setStudentCode((String) body.get("studentCode"));
                if (body.containsKey("enrollmentYear")) student.setEnrollmentYear((String) body.get("enrollmentYear"));
                studentRepository.save(student);
            }
        }

        // Update faculty-specific fields
        if ("FACULTY".equals(updated.getRole())) {
            Faculty faculty = facultyRepository.findByUserId(updated.getId()).orElse(null);
            if (faculty != null) {
                if (body.containsKey("department")) faculty.setDepartment((String) body.get("department"));
                if (body.containsKey("section")) faculty.setSection((String) body.get("section"));
                if (body.containsKey("facultyCode")) faculty.setFacultyCode((String) body.get("facultyCode"));
                if (body.containsKey("joiningYear")) faculty.setJoiningYear((String) body.get("joiningYear"));
                facultyRepository.save(faculty);
            }
        }

        saveAuditLog("User Updated", "Updated user: " + updated.getFullName(), updated.getId());
        return updated;
    }

    // =========================================
    // SEARCH USERS
    // =========================================

    public List<User> searchUsers(String name) {
        return userRepository.findByFullNameContainingIgnoreCase(name);
    }

    // =========================================
    // FILTER USERS BY ROLE
    // =========================================

    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    // =========================================
    // ASSIGN FACULTY
    // =========================================

    public User assignFaculty(Long id, String subject) {

        User user = userRepository.findById(id).orElseThrow();

        user.setAssignedSubject(subject);

        User updated = userRepository.save(user);

        saveAuditLog(
                "Faculty Assigned",
                "Assigned faculty to subject: " + subject,
                updated.getId()
        );

        return updated;
    }

    // =========================================
    // ADMIN SETTINGS
    // =========================================

    public AdminSettings saveSettings(AdminSettings settings) {

        AdminSettings current = adminSettingsRepository.findAll().stream()
                .max((left, right) -> Long.compare(left.getId(), right.getId()))
                .orElseGet(AdminSettings::new);

        current.setMaxFileSize(settings.getMaxFileSize());
        current.setMaxResubmissions(settings.getMaxResubmissions());
        current.setSubmissionDeadline(settings.getSubmissionDeadline());
        current.setAllowedFileTypes(settings.getAllowedFileTypes());

        AdminSettings saved = adminSettingsRepository.save(current);

        saveAuditLog(
                "Settings Updated",
                "Updated admin settings",
                null
        );

        return saved;
    }

    public List<AdminSettings> getAllSettings() {
        return adminSettingsRepository.findAll().stream()
                .max((left, right) -> Long.compare(left.getId(), right.getId()))
                .map(List::of)
                .orElseGet(List::of);
    }

    // =========================================
    // ADMIN ANALYTICS
    // =========================================

    public AdminAnalyticsDTO getAdminAnalytics() {

        AdminAnalyticsDTO dto = new AdminAnalyticsDTO();

        dto.setTotalUsers(userRepository.count());

        dto.setTotalProjects(projectMongoRepository.count());

        List<com.example.demo.entity.ProjectDocument> allProjects = projectMongoRepository.findAll();

        dto.setApprovedProjects(
                allProjects.stream()
                        .filter(project -> "APPROVED".equalsIgnoreCase(project.getStatus()))
                        .count());

        dto.setPendingProjects(
                allProjects.stream()
                        .filter(project -> "PENDING".equalsIgnoreCase(project.getStatus())
                                || "RESUBMITTED".equalsIgnoreCase(project.getStatus()))
                        .count());

        dto.setTotalCertificates(certificateMongoRepository.count());

        dto.setApprovedCertificates(
                certificateMongoRepository.findAll().stream()
                        .filter(certificate -> "APPROVED".equalsIgnoreCase(certificate.getStatus()))
                        .count());

        dto.setPendingCertificates(
                certificateMongoRepository.findAll().stream()
                        .filter(certificate -> "PENDING".equalsIgnoreCase(certificate.getStatus())
                                || "RESUBMITTED".equalsIgnoreCase(certificate.getStatus()))
                        .count());

        dto.setFacultyCount(
                userRepository.findAll().stream()
                        .filter(user -> "FACULTY".equalsIgnoreCase(user.getRole()))
                        .count());

        return dto;
    }

    // =========================================
    // NOTIFICATIONS
    // =========================================

    public NotificationDocument createNotification(NotificationDocument notification) {

        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        return notificationMongoRepository.save(notification);
    }

    public List<NotificationDocument> getNotifications(Long userId) {
        userRepository.findById(userId)
                .filter(user -> "ADMIN".equalsIgnoreCase(user.getRole()))
                .ifPresent(admin -> {
                    if (adminNotificationSyncs.add(admin.getId())) {
                        CompletableFuture.runAsync(() -> {
                            try {
                                syncAdminAuditNotifications(admin.getId());
                                syncAdminSubmissionNotifications(admin.getId());
                            } finally {
                                adminNotificationSyncs.remove(admin.getId());
                            }
                        });
                    }
                });
        return notificationMongoRepository.findByUserId(userId);
    }

    private void syncAdminAuditNotifications(Long adminId) {
        auditLogRepository.findAll().forEach(log -> {
            String title = log.getActionTitle() == null ? "System Activity" : log.getActionTitle();
            String message = log.getDescription() == null ? title : log.getDescription();
            saveAdminNotificationIfMissing(
                    adminId,
                    title,
                    message,
                    notificationTypeForAudit(title),
                    log.getCreatedAt());
        });
    }

    private void syncAdminSubmissionNotifications(Long adminId) {
        projectMongoRepository.findAll().forEach(project -> {
            String student = displayName(project.getStudentName(), "Student");
            String faculty = displayName(project.getFacultyName(), "Faculty");
            saveAdminNotificationIfMissing(
                    adminId,
                    "Project Submitted",
                    student + " submitted project '" + project.getTitle() + "' to " + faculty + ".",
                    "info",
                    null);

            if ("APPROVED".equalsIgnoreCase(project.getStatus()) || "REJECTED".equalsIgnoreCase(project.getStatus())) {
                saveAdminNotificationIfMissing(
                        adminId,
                        "Project " + normalizedStatus(project.getStatus()),
                        faculty + " " + project.getStatus().toLowerCase() + " project '" + project.getTitle() + "' from " + student + ".",
                        "APPROVED".equalsIgnoreCase(project.getStatus()) ? "success" : "danger",
                        null);
            }
        });

        certificateMongoRepository.findAll().forEach(certificate -> {
            String student = displayName(certificate.getStudentName(), "Student");
            String faculty = displayName(certificate.getFacultyName(), "Faculty");
            saveAdminNotificationIfMissing(
                    adminId,
                    "Certificate Submitted",
                    student + " submitted certificate '" + certificate.getTitle() + "' to " + faculty + ".",
                    "info",
                    null);

            if ("APPROVED".equalsIgnoreCase(certificate.getStatus()) || "REJECTED".equalsIgnoreCase(certificate.getStatus())) {
                saveAdminNotificationIfMissing(
                        adminId,
                        "Certificate " + normalizedStatus(certificate.getStatus()),
                        faculty + " " + certificate.getStatus().toLowerCase() + " certificate '" + certificate.getTitle() + "' from " + student + ".",
                        "APPROVED".equalsIgnoreCase(certificate.getStatus()) ? "success" : "danger",
                        null);
            }
        });
    }

    private void saveAdminNotificationIfMissing(
            Long adminId,
            String title,
            String message,
            String type,
            LocalDateTime createdAt) {
        if (notificationMongoRepository.existsByUserIdAndTitleAndMessage(adminId, title, message)) return;

        NotificationDocument notification = new NotificationDocument();
        notification.setUserId(adminId);
        notification.setRole("ADMIN");
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(createdAt == null ? LocalDateTime.now() : createdAt);
        notificationMongoRepository.save(notification);
    }

    private String displayName(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String normalizedStatus(String status) {
        return status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
    }

    private String notificationTypeForAudit(String title) {
        String normalized = title == null ? "" : title.toLowerCase();
        if (normalized.contains("approved")) return "success";
        if (normalized.contains("rejected") || normalized.contains("deleted")) return "danger";
        if (normalized.contains("deadline") || normalized.contains("settings")) return "warning";
        return "info";
    }

    public NotificationDocument markNotificationAsRead(String id) {

        NotificationDocument notification = notificationMongoRepository.findById(id).orElseThrow();

        notification.setRead(true);

        return notificationMongoRepository.save(notification);
    }

    public String deleteNotification(String id) {
        notificationMongoRepository.deleteById(id);
        return "Notification Deleted";
    }

    // =========================================
    // JWT LOGIN (returns AuthResponse)
    // =========================================

    public AuthResponse login(AuthRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        String loginPassword = decryptLoginPassword(request.getPassword());

        if (!passwordEncoder.matches(loginPassword, user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return new AuthResponse(token, user.getId(), user.getRole(), user.getFullName());
    }

    // =========================================
    // AUDIT LOG
    // =========================================

    public void saveAuditLog(String title, String description, Long performedBy) {

        AuditLog log = new AuditLog();

        log.setActionTitle(title);
        log.setDescription(description);

        if (performedBy != null) {
            userRepository.findById(performedBy).ifPresent(log::setPerformedBy);
        }

        log.setCreatedAt(LocalDateTime.now());

        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }

    private String decryptLoginPassword(String password) {
        if (password == null || !password.startsWith(ENCRYPTED_PASSWORD_PREFIX)) {
            return password;
        }

        try {
            String encryptedPayload = password.substring(ENCRYPTED_PASSWORD_PREFIX.length());
            String[] parts = encryptedPayload.split(":", 2);
            byte[] iv = Base64.getDecoder().decode(parts[0]);
            byte[] encryptedBytes = Base64.getDecoder().decode(parts[1]);
            SecretKeySpec key = new SecretKeySpec(
                    LOGIN_ENCRYPTION_KEY.getBytes(StandardCharsets.UTF_8),
                    "AES");
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));

            return new String(cipher.doFinal(encryptedBytes), StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
    }

    // =========================================
    // BULK UPLOAD USERS FROM EXCEL
    // =========================================
    public java.util.Map<String, Object> bulkRegisterFromExcel(org.springframework.web.multipart.MultipartFile file) {
        java.util.List<java.util.Map<String, String>> successList = new java.util.ArrayList<>();
        java.util.List<java.util.Map<String, String>> failureList = new java.util.ArrayList<>();

        try (org.apache.poi.ss.usermodel.Workbook workbook = org.apache.poi.ss.usermodel.WorkbookFactory.create(file.getInputStream())) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);

            // Expect header row: fullName, email, password, role, department, section
            int rowCount = sheet.getPhysicalNumberOfRows();
            for (int i = 1; i < rowCount; i++) { // skip header
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(i);
                if (row == null) continue;

                String fullName = getCellString(row, 0);
                String email = getCellString(row, 1);
                String password = getCellString(row, 2);
                String role = getCellString(row, 3);
                String department = getCellString(row, 4);
                String section = getCellString(row, 5);

                if (fullName.isBlank() || email.isBlank() || password.isBlank()) {
                    java.util.Map<String, String> fail = new java.util.HashMap<>();
                    fail.put("row", String.valueOf(i + 1));
                    fail.put("email", email);
                    fail.put("reason", "Missing required fields (fullName, email, or password)");
                    failureList.add(fail);
                    continue;
                }

                try {
                    User user = new User();
                    user.setFullName(fullName);
                    user.setEmail(email);
                    user.setPassword(password);
                    user.setRole(role.isBlank() ? "STUDENT" : role.toUpperCase());

                    User savedUser = register(user);

                    // Update department and section for student/faculty
                    if ("STUDENT".equals(savedUser.getRole())) {
                        Student student = studentRepository.findByUserId(savedUser.getId()).orElse(null);
                        if (student != null) {
                            student.setDepartment(department);
                            student.setSection(section);
                            studentRepository.save(student);
                        }
                    } else if ("FACULTY".equals(savedUser.getRole())) {
                        Faculty faculty = facultyRepository.findByUserId(savedUser.getId()).orElse(null);
                        if (faculty != null) {
                            faculty.setDepartment(department);
                            facultyRepository.save(faculty);
                        }
                    }

                    java.util.Map<String, String> success = new java.util.HashMap<>();
                    success.put("row", String.valueOf(i + 1));
                    success.put("email", email);
                    success.put("fullName", fullName);
                    successList.add(success);

                } catch (Exception ex) {
                    java.util.Map<String, String> fail = new java.util.HashMap<>();
                    fail.put("row", String.valueOf(i + 1));
                    fail.put("email", email);
                    fail.put("reason", ex.getMessage());
                    failureList.add(fail);
                }
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to parse Excel file: " + e.getMessage());
        }

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalSuccess", successList.size());
        result.put("totalFailed", failureList.size());
        result.put("successes", successList);
        result.put("failures", failureList);
        return result;
    }

    private String getCellString(org.apache.poi.ss.usermodel.Row row, int cellIndex) {
        org.apache.poi.ss.usermodel.Cell cell = row.getCell(cellIndex);
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }

    // =========================================
    // FACULTY - ASSIGNED STUDENTS
    // =========================================

    public List<Student> getStudentsByFacultyUserId(Long facultyUserId) {
        Optional<Faculty> faculty = facultyRepository.findByUserId(facultyUserId);
        if (faculty.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty not found");
        }
        return studentRepository.findByFacultyId(faculty.get().getId());
    }

    // =========================================
    // ADMIN - ASSIGN STUDENT TO FACULTY
    // =========================================

    public Student assignStudentToFaculty(Long studentUserId, Long facultyUserId) {
        Optional<Student> studentOpt = studentRepository.findByUserId(studentUserId);
        if (studentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        Optional<Faculty> facultyOpt = facultyRepository.findByUserId(facultyUserId);
        if (facultyOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty not found");
        }
        Student student = studentOpt.get();
        student.setFaculty(facultyOpt.get());
        return studentRepository.save(student);
    }

    public Student unassignStudentFromFaculty(Long studentUserId) {
        Optional<Student> studentOpt = studentRepository.findByUserId(studentUserId);
        if (studentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        Student student = studentOpt.get();
        student.setFaculty(null);
        return studentRepository.save(student);
    }

    // =========================================
    // ADMIN - ASSIGN STUDENTS BY DEPARTMENT
    // =========================================

    public List<Student> assignStudentsByDepartment(String department, String section, Long facultyUserId) {
        Optional<Faculty> facultyOpt = facultyRepository.findByUserId(facultyUserId);
        if (facultyOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty not found");
        }
        List<Student> students;
        if (section != null && !section.isBlank()) {
            students = studentRepository.findByDepartmentAndSection(department, section);
        } else {
            students = studentRepository.findByDepartment(department);
        }
        Faculty faculty = facultyOpt.get();
        for (Student student : students) {
            student.setFaculty(faculty);
            studentRepository.save(student);
        }
        return students;
    }

    public List<Student> getStudentsByDepartment(String department) {
        return studentRepository.findByDepartment(department);
    }
}
