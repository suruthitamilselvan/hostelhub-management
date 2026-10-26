package com.hostelhub.controllers;

import com.hostelhub.dto.FaceRegistrationRequest;
import com.hostelhub.dto.FaceVerificationRequest;
import com.hostelhub.dto.LoginRequest;
import com.hostelhub.models.User;
import com.hostelhub.repositories.UserRepository;
import com.hostelhub.services.FaceVerificationService;
import com.hostelhub.services.GeofenceService;
import com.hostelhub.models.Student;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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

    @GetMapping("/all-profiles")
    public ResponseEntity<?> getAllProfiles() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> profileList = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole() != null ? u.getRole().name().toLowerCase() : "student");
            map.put("hasFaceEnrolled", u.getFaceEmbedding() != null && !u.getFaceEmbedding().isBlank());
            map.put("facePhoto", u.getFacePhoto());
            if (u instanceof Student s) {
                map.put("registerNumber", s.getRegisterNumber());
                map.put("hostelBlock", s.getHostelBlock());
                map.put("roomNumber", s.getRoomNumber());
            }
            profileList.add(map);
        }
        return ResponseEntity.ok(profileList);
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

    @PostMapping("/reset-face/{userId}")
    public ResponseEntity<?> resetFace(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found with id: " + userId));
        }

        User user = userOpt.get();
        user.setFaceEmbedding(null);
        user.setFacePhoto(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Face biometric profile removed from MySQL database.",
            "userId", user.getId(),
            "hasFaceEnrolled", false
        ));
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

        // STRICT CHECK 1: If no face is enrolled in MySQL for this user, REJECT!
        boolean hasStored = storedEmbedding != null && !storedEmbedding.isBlank();
        if (!hasStored) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("faceVerified", false);
            resp.put("geofenceValid", isGeofenceValid);
            resp.put("overallVerified", false);
            resp.put("embeddingScore", 0.0);
            resp.put("hasStoredProfile", false);
            resp.put("userName", userName);
            resp.put("message", "No biometric face profile registered in MySQL for this resident. Please register your face first.");
            return ResponseEntity.ok(resp);
        }

        // STRICT CHECK 2: Calculate actual cosine similarity between stored MySQL vector and live camera vector
        boolean isFaceVerified = faceVerificationService.verifyFaceEmbedding(storedEmbedding, req.getIncomingEmbedding());
        double score = faceVerificationService.calculateSimilarity(storedEmbedding, req.getIncomingEmbedding());

        Map<String, Object> resp = new HashMap<>();
        resp.put("faceVerified", isFaceVerified);
        resp.put("geofenceValid", isGeofenceValid);
        resp.put("overallVerified", isFaceVerified && isGeofenceValid);
        resp.put("embeddingScore", Math.round(score * 1000.0) / 1000.0);
        resp.put("ipAddress", req.getIpAddress() != null ? req.getIpAddress() : "192.168.1.42 (Hostel Wi-Fi)");
        resp.put("userName", userName);
        resp.put("hasStoredProfile", true);
        resp.put("facePhoto", facePhoto);
        resp.put("message", isFaceVerified ? "Identity verified successfully!" : "Face did not match registered profile in MySQL.");

        return ResponseEntity.ok(resp);
    }
}
