package com.hostelhub.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "students")
public class Student extends User {

    private String registerNumber;
    private String hostelBlock;
    private String roomNumber;

    public Student() {}

    public Student(String name, String email, String password, String faceEmbedding, String registerNumber, String hostelBlock, String roomNumber) {
        super(null, name, email, password, Role.STUDENT, faceEmbedding);
        this.registerNumber = registerNumber;
        this.hostelBlock = hostelBlock;
        this.roomNumber = roomNumber;
    }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getHostelBlock() { return hostelBlock; }
    public void setHostelBlock(String hostelBlock) { this.hostelBlock = hostelBlock; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
}
