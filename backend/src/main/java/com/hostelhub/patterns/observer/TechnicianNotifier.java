package com.hostelhub.patterns.observer;

import com.hostelhub.models.Complaint;
import org.springframework.stereotype.Component;
import java.util.logging.Logger;

@Component
public class TechnicianNotifier implements ComplaintObserver {
    private static final Logger logger = Logger.getLogger(TechnicianNotifier.class.getName());

    @Override
    public void onStatusChanged(Complaint complaint, Complaint.Stage oldStage, Complaint.Stage newStage) {
        if (complaint.getAssignedTechnician() != null && newStage == Complaint.Stage.ASSIGNED) {
            String msg = String.format("[NOTIFICATION TO TECHNICIAN %s]: New job assigned: Ticket #%s (%s at %s)",
                    complaint.getAssignedTechnician().getName(), complaint.getId(), complaint.getTitle(), complaint.getLocationBlock());
            logger.info(msg);
        }
    }
}
