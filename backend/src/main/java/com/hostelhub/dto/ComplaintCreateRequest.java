package com.hostelhub.dto;

import com.hostelhub.models.Complaint;

public class ComplaintCreateRequest {
    private Long studentId;
    private Complaint.Category category;
    private String title;
    private String description;
    private String locationBlock;
    private String locationRoom;
    private String beforePhotoUrl;

    public ComplaintCreateRequest() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Complaint.Category getCategory() { return category; }
    public void setCategory(Complaint.Category category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocationBlock() { return locationBlock; }
    public void setLocationBlock(String locationBlock) { this.locationBlock = locationBlock; }

    public String getLocationRoom() { return locationRoom; }
    public void setLocationRoom(String locationRoom) { this.locationRoom = locationRoom; }

    public String getBeforePhotoUrl() { return beforePhotoUrl; }
    public void setBeforePhotoUrl(String beforePhotoUrl) { this.beforePhotoUrl = beforePhotoUrl; }
}
