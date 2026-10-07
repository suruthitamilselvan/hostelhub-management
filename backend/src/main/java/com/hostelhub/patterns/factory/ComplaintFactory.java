package com.hostelhub.patterns.factory;

import com.hostelhub.models.Complaint;
import com.hostelhub.models.Student;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Random;

@Component
public class ComplaintFactory {

    private final Random random = new Random();

    public Complaint createComplaint(Student student, Complaint.Category category, String title, 
                                     String description, String locationBlock, String locationRoom, 
                                     String beforePhotoUrl) {
        
        String id = "CH" + (1030 + random.nextInt(9000));

        // Auto-priority logic (Factory Pattern)
        // Electrical issues are automatically tagged HIGH priority due to safety risks
        Complaint.Priority priority = Complaint.Priority.MEDIUM;
        if (category == Complaint.Category.ELECTRICAL) {
            priority = Complaint.Priority.HIGH;
        } else if (category == Complaint.Category.HOUSEKEEPING) {
            priority = Complaint.Priority.LOW;
        }

        return Complaint.builder()
                .id(id)
                .student(student)
                .category(category)
                .title(title)
                .description(description)
                .locationBlock(locationBlock)
                .locationRoom(locationRoom)
                .priority(priority)
                .stage(Complaint.Stage.SUBMITTED)
                .beforePhotoUrl(beforePhotoUrl)
                .slaDeadlineText("24h to SLA")
                .slaBreached(false)
                .isMerged(false)
                .totalCost(0.0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
