package com.hostelhub.services;

import com.hostelhub.models.*;
import com.hostelhub.patterns.observer.ComplaintSubject;
import com.hostelhub.patterns.strategy.TechnicianAssignmentStrategy;
import com.hostelhub.repositories.ComplaintRepository;
import com.hostelhub.repositories.TechnicianRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class WardenService {

    private final ComplaintRepository complaintRepository;
    private final TechnicianRepository technicianRepository;
    private final TechnicianAssignmentStrategy leastLoadedStrategy;
    private final TechnicianAssignmentStrategy specialtyStrategy;
    private final ComplaintSubject complaintSubject;

    public WardenService(ComplaintRepository complaintRepository, TechnicianRepository technicianRepository,
                         @Qualifier("leastLoadedStrategy") TechnicianAssignmentStrategy leastLoadedStrategy,
                         @Qualifier("specialtyStrategy") TechnicianAssignmentStrategy specialtyStrategy,
                         ComplaintSubject complaintSubject) {
        this.complaintRepository = complaintRepository;
        this.technicianRepository = technicianRepository;
        this.leastLoadedStrategy = leastLoadedStrategy;
        this.specialtyStrategy = specialtyStrategy;
        this.complaintSubject = complaintSubject;
    }

    @Transactional
    public Complaint autoAssignTechnician(String ticketId, String strategyType) {
        Complaint complaint = complaintRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + ticketId));

        List<Technician> candidates = technicianRepository.findAll();
        if (candidates.isEmpty()) {
            throw new IllegalStateException("No available technicians found in the system.");
        }

        // Apply Strategy Pattern
        TechnicianAssignmentStrategy strategy = "specialty".equalsIgnoreCase(strategyType) ? specialtyStrategy : leastLoadedStrategy;
        Technician selectedTech = strategy.assign(complaint, candidates);

        if (selectedTech != null) {
            Complaint.Stage oldStage = complaint.getStage();
            complaint.setAssignedTechnician(selectedTech);
            complaint.setStage(Complaint.Stage.ASSIGNED);
            
            selectedTech.setActiveTasksCount(selectedTech.getActiveTasksCount() + 1);
            technicianRepository.save(selectedTech);

            Complaint updated = complaintRepository.save(complaint);
            complaintSubject.notifyStatusChange(updated, oldStage, Complaint.Stage.ASSIGNED);
            return updated;
        }

        return complaint;
    }

    @Transactional
    public void mergeComplaints(String targetTicketId, String sourceTicketId) {
        Complaint target = complaintRepository.findById(targetTicketId)
                .orElseThrow(() -> new IllegalArgumentException("Target complaint not found: " + targetTicketId));
        Complaint source = complaintRepository.findById(sourceTicketId)
                .orElseThrow(() -> new IllegalArgumentException("Source complaint not found: " + sourceTicketId));

        source.setMerged(true);
        source.setParentTicketId(targetTicketId);
        source.setStage(Complaint.Stage.CLOSED);
        complaintRepository.save(source);
    }

    public Map<String, Object> getDashboardMetrics() {
        List<Complaint> all = complaintRepository.findAll();

        long openCount = all.stream().filter(c -> c.getStage() != Complaint.Stage.COMPLETED && c.getStage() != Complaint.Stage.CLOSED).count();
        long slaBreaches = all.stream().filter(Complaint::isSlaBreached).count();
        long techniciansOnline = technicianRepository.count();

        // Calculate duplicate merge suggestions count
        List<Map<String, Object>> duplicates = getDuplicateSuggestions();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("openComplaints", openCount);
        metrics.put("slaBreaches", slaBreaches);
        metrics.put("mergeSuggestions", duplicates.size());
        metrics.put("techniciansOnline", techniciansOnline);

        return metrics;
    }

    public List<Map<String, Object>> getDuplicateSuggestions() {
        List<Complaint> openComplaints = complaintRepository.findAll().stream()
                .filter(c -> !c.isMerged() && (c.getStage() == Complaint.Stage.SUBMITTED || c.getStage() == Complaint.Stage.UNDER_REVIEW || c.getStage() == Complaint.Stage.ASSIGNED || c.getStage() == Complaint.Stage.IN_PROGRESS))
                .collect(Collectors.toList());

        Map<String, List<Complaint>> grouped = openComplaints.stream()
                .collect(Collectors.groupingBy(c -> c.getLocationBlock() + " · " + c.getCategory().name()));

        List<Map<String, Object>> suggestions = new ArrayList<>();
        for (Map.Entry<String, List<Complaint>> entry : grouped.entrySet()) {
            if (entry.getValue().size() > 1) {
                List<String> ticketIds = entry.getValue().stream().map(Complaint::getId).collect(Collectors.toList());
                Map<String, Object> item = new HashMap<>();
                item.put("groupKey", entry.getKey());
                item.put("block", entry.getValue().get(0).getLocationBlock());
                item.put("category", entry.getValue().get(0).getCategory().name());
                item.put("tickets", ticketIds);
                item.put("targetTicket", ticketIds.get(0));
                suggestions.add(item);
            }
        }

        return suggestions;
    }
}
