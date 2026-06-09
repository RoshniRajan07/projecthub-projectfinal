package com.example.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.service.ProjectService;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin("*")
public class DashboardController {

	@Autowired
	private ProjectService projectService;

	@GetMapping
	public Map<String, Long> getDashboardData() {

		return projectService.getDashboardData();
	}
}
