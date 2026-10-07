package com.hostelhub.patterns.observer;

import com.hostelhub.models.Complaint;
import org.springframework.stereotype.Component;
import java.util.logging.Logger;

@Component
public class WardenNotifier implements ComplaintObserver {
    private static final Logger logger = Logger.getLogger(WardenNotifier.class.getName());

    @Override
    public void onStatusChanged(Complaint complaint, Complaint.Stage oldStage, Complaint.Stage newStage) {
        String msg = String.format("[NOTIFICATION TO WARDEN]: Ticket #%s (%s - %s) stage updated to %s",
                complaint.getId(), complaint.getCategory(), complaint.getLocationBlock(), newStage);
        logger.info(msg);
    }
}
