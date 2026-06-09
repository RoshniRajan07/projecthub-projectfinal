package com.example.demo.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Student;

public interface StudentRepository
        extends JpaRepository<Student, Long> {

    Optional<Student> findByUserId(Long userId);
    List<Student> findByFacultyId(Long facultyId);
    List<Student> findByDepartment(String department);
    List<Student> findByDepartmentAndSection(String department, String section);
}