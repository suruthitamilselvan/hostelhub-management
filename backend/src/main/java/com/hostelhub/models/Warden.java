package com.hostelhub.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "wardens")
public class Warden extends User {

    private String designation;
    private String blockAssigned;

    public Warden() {}

    public Warden(String name, String email, String password, String designation, String blockAssigned) {
        super(null, name, email, password, Role.WARDEN, null);
        this.designation = designation;
        this.blockAssigned = blockAssigned;
    }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getBlockAssigned() { return blockAssigned; }
    public void setBlockAssigned(String blockAssigned) { this.blockAssigned = blockAssigned; }
}
