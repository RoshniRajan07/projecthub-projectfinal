package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.DeadlineRule;
import com.example.demo.service.ProjectService;

@RestController
@RequestMapping("/deadline-rules")
@CrossOrigin("*")
public class DeadlineRuleController {

    @Autowired
    private ProjectService projectService;

    // GET ALL DEADLINE RULES
    @GetMapping
    public List<DeadlineRule> getAllDeadlineRules() {
        return projectService.getAllDeadlineRules();
    }

    // GET BY TYPE (Project or Certificate)
    @GetMapping("/type/{type}")
    public List<DeadlineRule> getByType(@PathVariable String type) {
        return projectService.getDeadlineRulesByType(type);
    }

    // CREATE OR UPDATE A DEADLINE RULE
    @PostMapping
    public DeadlineRule createOrUpdate(@RequestBody DeadlineRule rule) {
        return projectService.createOrUpdateDeadlineRule(rule);
    }

    // DELETE A DEADLINE RULE
    @DeleteMapping("/{id}")
    public String deleteRule(@PathVariable String id) {
        return projectService.deleteDeadlineRule(id);
    }
}