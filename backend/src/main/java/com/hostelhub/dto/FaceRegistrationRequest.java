package com.hostelhub.dto;

public class FaceRegistrationRequest {
    private Long userId;
    private String faceEmbedding;
    private String facePhoto;

    public FaceRegistrationRequest() {}

    public FaceRegistrationRequest(Long userId, String faceEmbedding, String facePhoto) {
        this.userId = userId;
        this.faceEmbedding = faceEmbedding;
        this.facePhoto = facePhoto;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFaceEmbedding() { return faceEmbedding; }
    public void setFaceEmbedding(String faceEmbedding) { this.faceEmbedding = faceEmbedding; }

    public String getFacePhoto() { return facePhoto; }
    public void setFacePhoto(String facePhoto) { this.facePhoto = facePhoto; }
}
