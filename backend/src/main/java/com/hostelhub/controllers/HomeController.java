package com.hostelhub.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "HostelHub ERP Backend");
        status.put("version", "1.0.0");
        status.put("database", "MySQL Connected");
        status.put("frontendUrl", "https://hostelhub-management.vercel.app");
        status.put("serverTime", LocalDateTime.now().toString());
        return status;
    }
}
