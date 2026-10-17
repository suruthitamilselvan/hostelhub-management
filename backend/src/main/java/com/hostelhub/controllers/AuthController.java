package com.hostelhub.controllers;

import com.hostelhub.dto.FaceRegistrationRequest;
import com.hostelhub.dto.FaceVerificationRequest;
import com.hostelhub.dto.LoginRequest;
import com.hostelhub.models.User;
import com.hostelhub.repositories.UserRepository;
import com.hostelhub.services.FaceVerificationService;
import com.hostelhub.services.GeofenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final FaceVerificationService faceVerificationService;
    private final GeofenceService geofenceService;

    public AuthController(UserRepository userRepository, FaceVerificationService faceVerificationService, GeofenceService geofenceService) {
        this.userRepository = userRepository;
        this.faceVerificationService = faceVerificationService;
        this.geofenceService = geofenceService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Optional<User> userOpt = userRepository.findByEmail(req.getEmail());
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(req.getPassword())) {
            User user = userOpt.get();
            Map<String, Object> resp = new HashMap<>();
            resp.put("id", user.getId());
            resp.put("name", user.getName());
            resp.put("email", user.getEmail());
            resp.put("role", user.getRole());
            resp.put("token", "jwt-demo-token-" + user.getId());
            resp.put("hasFaceEnrolled", user.getFaceEmbedding() != null && !user.getFaceEmbedding().isBlank());
            resp.put("facePhoto", user.getFacePhoto());
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
    }

    @PostMapping("/register-face")
    public ResponseEntity<?> registerFace(@RequestBody FaceRegistrationRequest req) {
        if (req.getUserId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User ID is required"));
        }

        Optional<User> userOpt = userRepository.findById(req.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found with id: " + req.getUserId()));
        }

        User user = userOpt.get();
        if (req.getFaceEmbedding() != null && !req.getFaceEmbedding().isBlank()) {
            user.setFaceEmbedding(req.getFaceEmbedding());
        }
        if (req.getFacePhoto() != null && !req.getFacePhoto().isBlank()) {
            user.setFacePhoto(req.getFacePhoto());
        }
        userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Face biometric profile enrolled successfully in MySQL database!");
        resp.put("userId", user.getId());
        resp.put("name", user.getName());
        resp.put("hasFaceEnrolled", true);
        resp.put("facePhoto", user.getFacePhoto());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/face-status/{userId}")
    public ResponseEntity<?> getFaceStatus(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found with id: " + userId));
        }

        User user = userOpt.get();
        boolean hasFace = user.getFaceEmbedding() != null && !user.getFaceEmbedding().isBlank();
        Map<String, Object> resp = new HashMap<>();
        resp.put("userId", user.getId());
        resp.put("name", user.getName());
        resp.put("email", user.getEmail());
        resp.put("role", user.getRole());
        resp.put("hasFaceEnrolled", hasFace);
        resp.put("facePhoto", user.getFacePhoto());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/verify-face")
    public ResponseEntity<?> verifyFace(@RequestBody FaceVerificationRequest req) {
        boolean isGeofenceValid = geofenceService.isWithinHostelNetwork(req.getIpAddress());

        String storedEmbedding = null;
        String userName = "Hostel Resident";
        String facePhoto = null;
        if (req.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(req.getUserId());
            if (userOpt.isPresent()) {
                User u = userOpt.get();
                storedEmbedding = u.getFaceEmbedding();
                userName = u.getName();
                facePhoto = u.getFacePhoto();
            }
        }

        boolean isFaceVerified = faceVerificationService.verifyFaceEmbedding(storedEmbedding, req.getIncomingEmbedding());
        double score = faceVerificationService.calculateSimilarity(storedEmbedding, req.getIncomingEmbedding());

        Map<String, Object> resp = new HashMap<>();
        resp.put("faceVerified", isFaceVerified);
        resp.put("geofenceValid", isGeofenceValid);
        resp.put("overallVerified", isFaceVerified && isGeofenceValid);
        resp.put("embeddingScore", Math.round(score * 1000.0) / 1000.0);
        resp.put("ipAddress", req.getIpAddress() != null ? req.getIpAddress() : "192.168.1.42 (Hostel Wi-Fi)");
        resp.put("userName", userName);
        resp.put("hasStoredProfile", storedEmbedding != null && !storedEmbedding.isBlank());
        resp.put("facePhoto", facePhoto);

        return ResponseEntity.ok(resp);
    }
}
