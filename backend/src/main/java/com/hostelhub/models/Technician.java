package com.hostelhub.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "technicians")
public class Technician extends User {

    private String specialty;
    private int activeTasksCount;
    private int totalCompletedTasks;
    private double avgRating;

    public Technician() {}

    public Technician(String name, String email, String password, String specialty, int activeTasksCount, int totalCompletedTasks, double avgRating) {
        super(null, name, email, password, Role.TECHNICIAN, null);
        this.specialty = specialty;
        this.activeTasksCount = activeTasksCount;
        this.totalCompletedTasks = totalCompletedTasks;
        this.avgRating = avgRating;
    }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public int getActiveTasksCount() { return activeTasksCount; }
    public void setActiveTasksCount(int activeTasksCount) { this.activeTasksCount = activeTasksCount; }

    public int getTotalCompletedTasks() { return totalCompletedTasks; }
    public void setTotalCompletedTasks(int totalCompletedTasks) { this.totalCompletedTasks = totalCompletedTasks; }

    public double getAvgRating() { return avgRating; }
    public void setAvgRating(double avgRating) { this.avgRating = avgRating; }
}
