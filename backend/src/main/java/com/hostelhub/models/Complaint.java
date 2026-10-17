package com.hostelhub.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id")
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String locationBlock;

    @Column(nullable = false)
    private String locationRoom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Stage stage;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_technician_id")
    private Technician assignedTechnician;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String beforePhotoUrl;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String afterPhotoUrl;

    private String slaDeadlineText;
    private boolean slaBreached;

    private boolean isMerged;
    private String parentTicketId;

    private Integer rating;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<SparePart> spareParts = new ArrayList<>();

    private double totalCost;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Complaint() {}

    public Complaint(String id, Student student, Category category, String title, String description,
                     String locationBlock, String locationRoom, Priority priority, Stage stage,
                     Technician assignedTechnician, String beforePhotoUrl, String afterPhotoUrl,
                     String slaDeadlineText, boolean slaBreached, boolean isMerged, String parentTicketId,
                     Integer rating, List<SparePart> spareParts, double totalCost,
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.student = student;
        this.category = category;
        this.title = title;
        this.description = description;
        this.locationBlock = locationBlock;
        this.locationRoom = locationRoom;
        this.priority = priority;
        this.stage = stage;
        this.assignedTechnician = assignedTechnician;
        this.beforePhotoUrl = beforePhotoUrl;
        this.afterPhotoUrl = afterPhotoUrl;
        this.slaDeadlineText = slaDeadlineText;
        this.slaBreached = slaBreached;
        this.isMerged = isMerged;
        this.parentTicketId = parentTicketId;
        this.rating = rating;
        if (spareParts != null) this.spareParts = spareParts;
        this.totalCost = totalCost;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocationBlock() { return locationBlock; }
    public void setLocationBlock(String locationBlock) { this.locationBlock = locationBlock; }

    public String getLocationRoom() { return locationRoom; }
    public void setLocationRoom(String locationRoom) { this.locationRoom = locationRoom; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Stage getStage() { return stage; }
    public void setStage(Stage stage) { this.stage = stage; }

    public Technician getAssignedTechnician() { return assignedTechnician; }
    public void setAssignedTechnician(Technician assignedTechnician) { this.assignedTechnician = assignedTechnician; }

    public String getBeforePhotoUrl() { return beforePhotoUrl; }
    public void setBeforePhotoUrl(String beforePhotoUrl) { this.beforePhotoUrl = beforePhotoUrl; }

    public String getAfterPhotoUrl() { return afterPhotoUrl; }
    public void setAfterPhotoUrl(String afterPhotoUrl) { this.afterPhotoUrl = afterPhotoUrl; }

    public String getSlaDeadlineText() { return slaDeadlineText; }
    public void setSlaDeadlineText(String slaDeadlineText) { this.slaDeadlineText = slaDeadlineText; }

    public boolean isSlaBreached() { return slaBreached; }
    public void setSlaBreached(boolean slaBreached) { this.slaBreached = slaBreached; }

    public boolean isMerged() { return isMerged; }
    public void setMerged(boolean merged) { isMerged = merged; }

    public String getParentTicketId() { return parentTicketId; }
    public void setParentTicketId(String parentTicketId) { this.parentTicketId = parentTicketId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public List<SparePart> getSpareParts() { return spareParts; }
    public void setSpareParts(List<SparePart> spareParts) { this.spareParts = spareParts; }

    public double getTotalCost() { return totalCost; }
    public void setTotalCost(double totalCost) { this.totalCost = totalCost; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum Category { ELECTRICAL, PLUMBING, CARPENTRY, HOUSEKEEPING, INTERNET }
    public enum Priority { LOW, MEDIUM, HIGH }
    public enum Stage { SUBMITTED, UNDER_REVIEW, ASSIGNED, IN_PROGRESS, COMPLETED, CLOSED }

    public static ComplaintBuilder builder() { return new ComplaintBuilder(); }

    public static class ComplaintBuilder {
        private String id;
        private Student student;
        private Category category;
        private String title;
        private String description;
        private String locationBlock;
        private String locationRoom;
        private Priority priority;
        private Stage stage;
        private Technician assignedTechnician;
        private String beforePhotoUrl;
        private String afterPhotoUrl;
        private String slaDeadlineText;
        private boolean slaBreached;
        private boolean isMerged;
        private String parentTicketId;
        private Integer rating;
        private List<SparePart> spareParts = new ArrayList<>();
        private double totalCost;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ComplaintBuilder id(String id) { this.id = id; return this; }
        public ComplaintBuilder student(Student student) { this.student = student; return this; }
        public ComplaintBuilder category(Category category) { this.category = category; return this; }
        public ComplaintBuilder title(String title) { this.title = title; return this; }
        public ComplaintBuilder description(String description) { this.description = description; return this; }
        public ComplaintBuilder locationBlock(String locationBlock) { this.locationBlock = locationBlock; return this; }
        public ComplaintBuilder locationRoom(String locationRoom) { this.locationRoom = locationRoom; return this; }
        public ComplaintBuilder priority(Priority priority) { this.priority = priority; return this; }
        public ComplaintBuilder stage(Stage stage) { this.stage = stage; return this; }
        public ComplaintBuilder assignedTechnician(Technician assignedTechnician) { this.assignedTechnician = assignedTechnician; return this; }
        public ComplaintBuilder beforePhotoUrl(String beforePhotoUrl) { this.beforePhotoUrl = beforePhotoUrl; return this; }
        public ComplaintBuilder afterPhotoUrl(String afterPhotoUrl) { this.afterPhotoUrl = afterPhotoUrl; return this; }
        public ComplaintBuilder slaDeadlineText(String slaDeadlineText) { this.slaDeadlineText = slaDeadlineText; return this; }
        public ComplaintBuilder slaBreached(boolean slaBreached) { this.slaBreached = slaBreached; return this; }
        public ComplaintBuilder isMerged(boolean isMerged) { this.isMerged = isMerged; return this; }
        public ComplaintBuilder parentTicketId(String parentTicketId) { this.parentTicketId = parentTicketId; return this; }
        public ComplaintBuilder rating(Integer rating) { this.rating = rating; return this; }
        public ComplaintBuilder spareParts(List<SparePart> spareParts) { this.spareParts = spareParts; return this; }
        public ComplaintBuilder totalCost(double totalCost) { this.totalCost = totalCost; return this; }
        public ComplaintBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ComplaintBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Complaint build() {
            return new Complaint(id, student, category, title, description, locationBlock, locationRoom, priority, stage, assignedTechnician, beforePhotoUrl, afterPhotoUrl, slaDeadlineText, slaBreached, isMerged, parentTicketId, rating, spareParts, totalCost, createdAt, updatedAt);
        }
    }
}
