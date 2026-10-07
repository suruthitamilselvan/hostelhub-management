package com.hostelhub.config;

import com.hostelhub.models.*;
import com.hostelhub.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final WardenRepository wardenRepository;
    private final TechnicianRepository technicianRepository;
    private final ComplaintRepository complaintRepository;
    private final SparePartRepository sparePartRepository;

    public DataInitializer(StudentRepository studentRepository, WardenRepository wardenRepository,
                           TechnicianRepository technicianRepository, ComplaintRepository complaintRepository,
                           SparePartRepository sparePartRepository) {
        this.studentRepository = studentRepository;
        this.wardenRepository = wardenRepository;
        this.technicianRepository = technicianRepository;
        this.complaintRepository = complaintRepository;
        this.sparePartRepository = sparePartRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (complaintRepository.count() > 0) {
            return; // Seed data already exists
        }

        // 1. Create Student
        Student student = new Student(
                "Suruthi T.", "suruthi@hostel.edu", "password123",
                "[0.12,0.45,-0.23,0.88,0.14]", "21CS042", "Block B", "204"
        );
        student = studentRepository.save(student);

        // 2. Create Warden
        Warden warden = new Warden("Dr. Lakshmi V.", "lakshmi@hostel.edu", "admin123", "Chief Warden", "Block B");
        wardenRepository.save(warden);

        // 3. Create Technicians
        Technician techAnand = new Technician("Anand Pillai", "anand@hostel.edu", "tech123", "Plumbing", 1, 96, 4.4);
        Technician techDivya = new Technician("Divya S", "divya@hostel.edu", "tech123", "Internet", 0, 45, 4.8);
        Technician techRajesh = new Technician("K. Rajesh", "rajesh@hostel.edu", "tech123", "Electrical", 2, 110, 4.6);
        Technician techSenthil = new Technician("M. Senthil", "senthil@hostel.edu", "tech123", "Carpentry", 0, 60, 4.5);

        techAnand = technicianRepository.save(techAnand);
        techDivya = technicianRepository.save(techDivya);
        techRajesh = technicianRepository.save(techRajesh);
        techSenthil = technicianRepository.save(techSenthil);

        // 4. Create Complaints matching reference screenshots
        Complaint c1 = Complaint.builder()
                .id("CH1025")
                .student(student)
                .category(Complaint.Category.PLUMBING)
                .title("Wash basin tap leaking continuously")
                .description("Bathroom tap is leaking continuously creating noise and wasting water.")
                .locationBlock("Block B")
                .locationRoom("204")
                .priority(Complaint.Priority.MEDIUM)
                .stage(Complaint.Stage.IN_PROGRESS)
                .assignedTechnician(techAnand)
                .beforePhotoUrl("before-tap.jpg")
                .slaDeadlineText("5h to SLA")
                .slaBreached(false)
                .totalCost(90.0)
                .createdAt(LocalDateTime.now().minusHours(4))
                .build();
        c1 = complaintRepository.save(c1);

        // Add Spare Part to CH1025
        SparePart part1 = SparePart.builder()
                .complaint(c1)
                .partName("Tap washer set")
                .quantity(2)
                .unitCost(45.0)
                .lineTotal(90.0)
                .build();
        sparePartRepository.save(part1);

        Complaint c2 = Complaint.builder()
                .id("CH1026")
                .student(student)
                .category(Complaint.Category.ELECTRICAL)
                .title("Power socket sparking near study table")
                .description("Electrical spark observed when plugging laptop charger.")
                .locationBlock("Block B")
                .locationRoom("207")
                .priority(Complaint.Priority.HIGH)
                .stage(Complaint.Stage.ASSIGNED)
                .assignedTechnician(techRajesh)
                .slaDeadlineText("SLA breached · 5h over")
                .slaBreached(true)
                .createdAt(LocalDateTime.now().minusHours(29))
                .build();
        complaintRepository.save(c2);

        Complaint c3 = Complaint.builder()
                .id("CH1027")
                .student(student)
                .category(Complaint.Category.ELECTRICAL)
                .title("Corridor lights not working on 2nd floor")
                .description("Dark hallway on 2nd floor corridor.")
                .locationBlock("Block B")
                .locationRoom("Corridor")
                .priority(Complaint.Priority.HIGH)
                .stage(Complaint.Stage.UNDER_REVIEW)
                .slaDeadlineText("SLA breached · 2h over")
                .slaBreached(true)
                .createdAt(LocalDateTime.now().minusHours(26))
                .build();
        complaintRepository.save(c3);

        Complaint c4 = Complaint.builder()
                .id("CH1028")
                .student(student)
                .category(Complaint.Category.INTERNET)
                .title("Wi-Fi drops every 10 minutes")
                .description("Unstable router connection in room 312.")
                .locationBlock("Block C")
                .locationRoom("312")
                .priority(Complaint.Priority.MEDIUM)
                .stage(Complaint.Stage.COMPLETED)
                .assignedTechnician(techDivya)
                .slaDeadlineText("18h to SLA")
                .rating(5)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();
        complaintRepository.save(c4);

        Complaint c5 = Complaint.builder()
                .id("CH1029")
                .student(student)
                .category(Complaint.Category.CARPENTRY)
                .title("Cupboard door hinge broken")
                .description("Wooden cupboard door came off hinge.")
                .locationBlock("Block A")
                .locationRoom("115")
                .priority(Complaint.Priority.LOW)
                .stage(Complaint.Stage.CLOSED)
                .assignedTechnician(techSenthil)
                .slaDeadlineText("32h to SLA")
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();
        complaintRepository.save(c5);

        Complaint c6 = Complaint.builder()
                .id("CH1030")
                .student(student)
                .category(Complaint.Category.PLUMBING)
                .title("Bathroom drain blocked")
                .description("Water standing in bathroom drain.")
                .locationBlock("Block B")
                .locationRoom("210")
                .priority(Complaint.Priority.MEDIUM)
                .stage(Complaint.Stage.SUBMITTED)
                .slaDeadlineText("SLA breached · 2h over")
                .slaBreached(true)
                .createdAt(LocalDateTime.now().minusHours(26))
                .build();
        complaintRepository.save(c6);
    }
}
