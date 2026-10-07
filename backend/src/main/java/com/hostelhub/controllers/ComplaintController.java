package com.hostelhub.controllers;

import com.hostelhub.dto.ComplaintCreateRequest;
import com.hostelhub.models.Complaint;
import com.hostelhub.services.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Complaint>> getStudentComplaints(@PathVariable Long studentId) {
        return ResponseEntity.ok(complaintService.getStudentComplaints(studentId));
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody ComplaintCreateRequest req) {
        return ResponseEntity.ok(complaintService.createComplaint(req));
    }

    @PutMapping("/{id}/stage")
    public ResponseEntity<Complaint> updateStage(@PathVariable String id, @RequestBody Map<String, String> body) {
        Complaint.Stage stage = Complaint.Stage.valueOf(body.get("stage"));
        return ResponseEntity.ok(complaintService.updateComplaintStage(id, stage));
    }

    @PutMapping("/{id}/rate")
    public ResponseEntity<Complaint> rateComplaint(@PathVariable String id, @RequestBody Map<String, Integer> body) {
        int rating = body.getOrDefault("rating", 5);
        return ResponseEntity.ok(complaintService.rateComplaint(id, rating));
    }
}
