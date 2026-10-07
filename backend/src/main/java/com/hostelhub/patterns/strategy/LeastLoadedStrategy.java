package com.hostelhub.patterns.strategy;

import com.hostelhub.models.Complaint;
import com.hostelhub.models.Technician;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component("leastLoadedStrategy")
public class LeastLoadedStrategy implements TechnicianAssignmentStrategy {

    @Override
    public Technician assign(Complaint complaint, List<Technician> candidates) {
        if (candidates == null || candidates.isEmpty()) {
            return null;
        }

        // Pick technician with the lowest active tasks count (Workload Balancing)
        return candidates.stream()
                .min(Comparator.comparingInt(Technician::getActiveTasksCount))
                .orElse(candidates.get(0));
    }
}
