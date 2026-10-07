package com.hostelhub.patterns.strategy;

import com.hostelhub.models.Complaint;
import com.hostelhub.models.Technician;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component("specialtyStrategy")
public class SpecialtyStrategy implements TechnicianAssignmentStrategy {

    @Override
    public Technician assign(Complaint complaint, List<Technician> candidates) {
        if (candidates == null || candidates.isEmpty()) {
            return null;
        }

        String targetSpecialty = complaint.getCategory().name();

        // First filter by matching specialty
        return candidates.stream()
                .filter(t -> t.getSpecialty() != null && t.getSpecialty().equalsIgnoreCase(targetSpecialty))
                .min(Comparator.comparingInt(Technician::getActiveTasksCount))
                .orElseGet(() -> 
                    // Fallback to least loaded overall if no specialty match found
                    candidates.stream()
                            .min(Comparator.comparingInt(Technician::getActiveTasksCount))
                            .orElse(candidates.get(0))
                );
    }
}
