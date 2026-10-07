package com.hostelhub.patterns.observer;

import com.hostelhub.models.Complaint;

public interface ComplaintObserver {
    void onStatusChanged(Complaint complaint, Complaint.Stage oldStage, Complaint.Stage newStage);
}
