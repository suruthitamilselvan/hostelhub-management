package com.hostelhub.repositories;

import com.hostelhub.models.Warden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WardenRepository extends JpaRepository<Warden, Long> {
}
