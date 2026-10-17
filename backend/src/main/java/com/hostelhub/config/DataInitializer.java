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

        // Complaints start empty — ready for real student submissions
    }
}
