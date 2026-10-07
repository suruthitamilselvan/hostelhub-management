package com.hostelhub.services;

import com.hostelhub.dto.SparePartDto;
import com.hostelhub.models.Complaint;
import com.hostelhub.models.SparePart;
import com.hostelhub.models.Technician;
import com.hostelhub.patterns.observer.ComplaintSubject;
import com.hostelhub.repositories.ComplaintRepository;
import com.hostelhub.repositories.SparePartRepository;
import com.hostelhub.repositories.TechnicianRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TechnicianService {

    private final ComplaintRepository complaintRepository;
    private final SparePartRepository sparePartRepository;
    private final TechnicianRepository technicianRepository;
    private final ComplaintSubject complaintSubject;

    public TechnicianService(ComplaintRepository complaintRepository, SparePartRepository sparePartRepository,
                             TechnicianRepository technicianRepository, ComplaintSubject complaintSubject) {
        this.complaintRepository = complaintRepository;
        this.sparePartRepository = sparePartRepository;
        this.technicianRepository = technicianRepository;
        this.complaintSubject = complaintSubject;
    }

    public List<Complaint> getTechnicianJobs(Long technicianId) {
        return complaintRepository.findByAssignedTechnicianId(technicianId);
    }

    @Transactional
    public Complaint addSparePart(String complaintId, SparePartDto dto) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));

        double lineTotal = dto.getQuantity() * dto.getUnitCost();

        SparePart part = SparePart.builder()
                .complaint(complaint)
                .partName(dto.getPartName())
                .quantity(dto.getQuantity())
                .unitCost(dto.getUnitCost())
                .lineTotal(lineTotal)
                .build();

        sparePartRepository.save(part);

        // Recalculate total cost
        List<SparePart> parts = sparePartRepository.findByComplaintId(complaintId);
        double grandTotal = parts.stream().mapToDouble(SparePart::getLineTotal).sum();
        complaint.setTotalCost(grandTotal);

        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint markCompleted(String complaintId, String afterPhotoUrl) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));

        Complaint.Stage oldStage = complaint.getStage();
        complaint.setStage(Complaint.Stage.COMPLETED);
        if (afterPhotoUrl != null && !afterPhotoUrl.isBlank()) {
            complaint.setAfterPhotoUrl(afterPhotoUrl);
        }

        // Update technician task stats
        Technician tech = complaint.getAssignedTechnician();
        if (tech != null) {
            tech.setTotalCompletedTasks(tech.getTotalCompletedTasks() + 1);
            if (tech.getActiveTasksCount() > 0) {
                tech.setActiveTasksCount(tech.getActiveTasksCount() - 1);
            }
            technicianRepository.save(tech);
        }

        Complaint updated = complaintRepository.save(complaint);
        complaintSubject.notifyStatusChange(updated, oldStage, Complaint.Stage.COMPLETED);

        return updated;
    }
}
