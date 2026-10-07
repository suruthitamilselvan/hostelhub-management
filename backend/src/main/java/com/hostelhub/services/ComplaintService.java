package com.hostelhub.services;

import com.hostelhub.dto.ComplaintCreateRequest;
import com.hostelhub.models.Complaint;
import com.hostelhub.models.Student;
import com.hostelhub.patterns.factory.ComplaintFactory;
import com.hostelhub.patterns.observer.ComplaintSubject;
import com.hostelhub.repositories.ComplaintRepository;
import com.hostelhub.repositories.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;
    private final ComplaintFactory complaintFactory;
    private final ComplaintSubject complaintSubject;

    public ComplaintService(ComplaintRepository complaintRepository, StudentRepository studentRepository,
                            ComplaintFactory complaintFactory, ComplaintSubject complaintSubject) {
        this.complaintRepository = complaintRepository;
        this.studentRepository = studentRepository;
        this.complaintFactory = complaintFactory;
        this.complaintSubject = complaintSubject;
    }

    @Transactional
    public Complaint createComplaint(ComplaintCreateRequest req) {
        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + req.getStudentId()));

        // Use Factory Pattern to construct complaint
        Complaint complaint = complaintFactory.createComplaint(
                student, req.getCategory(), req.getTitle(), req.getDescription(),
                req.getLocationBlock(), req.getLocationRoom(), req.getBeforePhotoUrl()
        );

        complaint = complaintRepository.save(complaint);

        // Notify Observers (Student & Warden)
        complaintSubject.notifyStatusChange(complaint, null, Complaint.Stage.SUBMITTED);

        return complaint;
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public List<Complaint> getStudentComplaints(Long studentId) {
        return complaintRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Transactional
    public Complaint updateComplaintStage(String ticketId, Complaint.Stage newStage) {
        Complaint complaint = complaintRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + ticketId));

        Complaint.Stage oldStage = complaint.getStage();
        complaint.setStage(newStage);

        Complaint updated = complaintRepository.save(complaint);

        // Trigger Observer Pattern
        complaintSubject.notifyStatusChange(updated, oldStage, newStage);

        return updated;
    }

    @Transactional
    public Complaint rateComplaint(String ticketId, int rating) {
        Complaint complaint = complaintRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + ticketId));

        complaint.setRating(rating);
        return complaintRepository.save(complaint);
    }
}
