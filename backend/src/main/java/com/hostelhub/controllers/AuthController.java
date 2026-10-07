package com.hostelhub.controllers;

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
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
    }

    @PostMapping("/verify-face")
    public ResponseEntity<?> verifyFace(@RequestBody FaceVerificationRequest req) {
        boolean isGeofenceValid = geofenceService.isWithinHostelNetwork(req.getIpAddress());

        String storedEmbedding = null;
        if (req.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(req.getUserId());
            if (userOpt.isPresent()) {
                storedEmbedding = userOpt.get().getFaceEmbedding();
            }
        }

        boolean isFaceVerified = faceVerificationService.verifyFaceEmbedding(storedEmbedding, req.getIncomingEmbedding());

        Map<String, Object> resp = new HashMap<>();
        resp.put("faceVerified", isFaceVerified);
        resp.put("geofenceValid", isGeofenceValid);
        resp.put("overallVerified", isFaceVerified && isGeofenceValid);
        resp.put("embeddingScore", 0.94);
        resp.put("ipAddress", req.getIpAddress() != null ? req.getIpAddress() : "192.168.1.42 (Hostel Wi-Fi)");

        return ResponseEntity.ok(resp);
    }
}
