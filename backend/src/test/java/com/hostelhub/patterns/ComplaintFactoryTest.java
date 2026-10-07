package com.hostelhub.patterns;

import com.hostelhub.models.Complaint;
import com.hostelhub.models.Student;
import com.hostelhub.patterns.factory.ComplaintFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ComplaintFactoryTest {

    private ComplaintFactory complaintFactory;
    private Student dummyStudent;

    @BeforeEach
    void setUp() {
        complaintFactory = new ComplaintFactory();
        dummyStudent = new Student("Suruthi T.", "suruthi@hostel.edu", "pass", "[]", "21CS042", "Block B", "204");
    }

    @Test
    void testElectricalCategory_AutoAssignsHighPriority() {
        Complaint complaint = complaintFactory.createComplaint(
                dummyStudent,
                Complaint.Category.ELECTRICAL,
                "Sparking Outlet",
                "Spark near desk",
                "Block B",
                "207",
                null
        );

        assertNotNull(complaint.getId());
        assertTrue(complaint.getId().startsWith("CH"));
        assertEquals(Complaint.Priority.HIGH, complaint.getPriority(), "Electrical complaints must auto-assign HIGH priority");
        assertEquals(Complaint.Stage.SUBMITTED, complaint.getStage());
    }

    @Test
    void testPlumbingCategory_DefaultsToMediumPriority() {
        Complaint complaint = complaintFactory.createComplaint(
                dummyStudent,
                Complaint.Category.PLUMBING,
                "Tap Leaking",
                "Water leaking",
                "Block B",
                "204",
                null
        );

        assertEquals(Complaint.Priority.MEDIUM, complaint.getPriority());
    }
}
