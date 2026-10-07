package com.hostelhub.dto;

public class MergeRequest {
    private String targetTicketId;
    private String sourceTicketId;

    public MergeRequest() {}

    public String getTargetTicketId() { return targetTicketId; }
    public void setTargetTicketId(String targetTicketId) { this.targetTicketId = targetTicketId; }

    public String getSourceTicketId() { return sourceTicketId; }
    public void setSourceTicketId(String sourceTicketId) { this.sourceTicketId = sourceTicketId; }
}
