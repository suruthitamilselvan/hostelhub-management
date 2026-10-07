package com.hostelhub.patterns.strategy;

import com.hostelhub.models.Complaint;
import com.hostelhub.models.Technician;
import java.util.List;

public interface TechnicianAssignmentStrategy {
    Technician assign(Complaint complaint, List<Technician> candidates);
}
