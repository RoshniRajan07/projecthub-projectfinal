package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin("*")
@RestController
@RequestMapping("/landing")
public class LandingController {

    @GetMapping("/click")
    public Map<String, Object> trackClick(@RequestParam(defaultValue = "unknown") String action) {
        return Map.of(
                "status", "tracked",
                "action", action,
                "time", LocalDateTime.now().toString());
    }
}
