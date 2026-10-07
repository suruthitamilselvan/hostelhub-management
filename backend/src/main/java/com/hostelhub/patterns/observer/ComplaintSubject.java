package com.hostelhub.patterns.observer;

import com.hostelhub.models.Complaint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ComplaintSubject {

    private final List<ComplaintObserver> observers = new ArrayList<>();

    @Autowired
    public ComplaintSubject(StudentNotifier studentNotifier, WardenNotifier wardenNotifier, TechnicianNotifier technicianNotifier) {
        this.observers.add(studentNotifier);
        this.observers.add(wardenNotifier);
        this.observers.add(technicianNotifier);
    }

    public void registerObserver(ComplaintObserver observer) {
        observers.add(observer);
    }

    public void removeObserver(ComplaintObserver observer) {
        observers.remove(observer);
    }

    public void notifyStatusChange(Complaint complaint, Complaint.Stage oldStage, Complaint.Stage newStage) {
        for (ComplaintObserver observer : observers) {
            observer.onStatusChanged(complaint, oldStage, newStage);
        }
    }
}
