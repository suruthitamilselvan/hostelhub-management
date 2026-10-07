package com.hostelhub.controllers;

import com.hostelhub.dto.SparePartDto;
import com.hostelhub.models.Complaint;
import com.hostelhub.services.TechnicianService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/technician")
@CrossOrigin(origins = "*")
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @GetMapping("/queue/{technicianId}")
    public ResponseEntity<List<Complaint>> getQueue(@PathVariable Long technicianId) {
        return ResponseEntity.ok(technicianService.getTechnicianJobs(technicianId));
    }

    @PostMapping("/{complaintId}/parts")
    public ResponseEntity<Complaint> addPart(@PathVariable String complaintId, @RequestBody SparePartDto dto) {
        return ResponseEntity.ok(technicianService.addSparePart(complaintId, dto));
    }

    @PostMapping("/{complaintId}/complete")
    public ResponseEntity<Complaint> markCompleted(@PathVariable String complaintId, @RequestBody(required = false) Map<String, String> body) {
        String afterPhotoUrl = body != null ? body.get("afterPhotoUrl") : null;
        return ResponseEntity.ok(technicianService.markCompleted(complaintId, afterPhotoUrl));
    }
}
