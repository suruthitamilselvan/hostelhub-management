package com.hostelhub.dto;

public class FaceVerificationRequest {
    private Long userId;
    private String incomingEmbedding;
    private String ipAddress;

    public FaceVerificationRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getIncomingEmbedding() { return incomingEmbedding; }
    public void setIncomingEmbedding(String incomingEmbedding) { this.incomingEmbedding = incomingEmbedding; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
