package com.hostelhub.repositories;

import com.hostelhub.models.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {

    List<Complaint> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Complaint> findByAssignedTechnicianId(Long technicianId);

    List<Complaint> findBySlaBreachedTrue();

    // Query to detect duplicate complaints (same block & category with active open status)
    @Query("SELECT c FROM Complaint c WHERE c.locationBlock = :block AND c.category = :category AND c.stage IN ('SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS') AND c.isMerged = false")
    List<Complaint> findPotentialDuplicates(@Param("block") String block, @Param("category") Complaint.Category category);
}
