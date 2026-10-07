package com.hostelhub.patterns.observer;

import com.hostelhub.models.Complaint;
import org.springframework.stereotype.Component;
import java.util.logging.Logger;

@Component
public class StudentNotifier implements ComplaintObserver {
    private static final Logger logger = Logger.getLogger(StudentNotifier.class.getName());

    @Override
    public void onStatusChanged(Complaint complaint, Complaint.Stage oldStage, Complaint.Stage newStage) {
        if (complaint.getStudent() != null) {
            String msg = String.format("[NOTIFICATION TO STUDENT %s]: Complaint #%s changed from %s to %s",
                    complaint.getStudent().getName(), complaint.getId(), oldStage, newStage);
            logger.info(msg);
        }
    }
}
