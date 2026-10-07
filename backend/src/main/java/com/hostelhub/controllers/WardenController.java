package com.hostelhub.controllers;

import com.hostelhub.dto.MergeRequest;
import com.hostelhub.models.Complaint;
import com.hostelhub.services.WardenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/warden")
@CrossOrigin(origins = "*")
public class WardenController {

    private final WardenService wardenService;

    public WardenController(WardenService wardenService) {
        this.wardenService = wardenService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(wardenService.getDashboardMetrics());
    }

    @GetMapping("/duplicate-suggestions")
    public ResponseEntity<List<Map<String, Object>>> getDuplicateSuggestions() {
        return ResponseEntity.ok(wardenService.getDuplicateSuggestions());
    }

    @PostMapping("/auto-assign/{ticketId}")
    public ResponseEntity<Complaint> autoAssign(@PathVariable String ticketId, @RequestParam(defaultValue = "leastLoaded") String strategy) {
        return ResponseEntity.ok(wardenService.autoAssignTechnician(ticketId, strategy));
    }

    @PostMapping("/merge")
    public ResponseEntity<Map<String, String>> mergeComplaints(@RequestBody MergeRequest req) {
        wardenService.mergeComplaints(req.getTargetTicketId(), req.getSourceTicketId());
        return ResponseEntity.ok(Map.of("message", "Ticket #" + req.getSourceTicketId() + " merged into #" + req.getTargetTicketId()));
    }
}
