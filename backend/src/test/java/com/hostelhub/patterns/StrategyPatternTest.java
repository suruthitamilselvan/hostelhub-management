package com.hostelhub.patterns;

import com.hostelhub.models.Complaint;
import com.hostelhub.models.Technician;
import com.hostelhub.patterns.strategy.LeastLoadedStrategy;
import com.hostelhub.patterns.strategy.SpecialtyStrategy;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class StrategyPatternTest {

    @Test
    void testLeastLoadedStrategy_SelectsTechnicianWithLowestTasks() {
        LeastLoadedStrategy strategy = new LeastLoadedStrategy();

        Technician tech1 = new Technician("Anand", "a@h.com", "p", "Plumbing", 4, 10, 4.5);
        Technician tech2 = new Technician("Divya", "d@h.com", "p", "Internet", 1, 20, 4.8);
        Technician tech3 = new Technician("Rajesh", "r@h.com", "p", "Electrical", 3, 15, 4.6);

        Complaint dummyComplaint = Complaint.builder().category(Complaint.Category.PLUMBING).build();

        Technician selected = strategy.assign(dummyComplaint, List.of(tech1, tech2, tech3));

        assertNotNull(selected);
        assertEquals("Divya", selected.getName(), "Should pick Divya as she has the minimum active tasks (1)");
    }

    @Test
    void testSpecialtyStrategy_MatchesCategoryFirst() {
        SpecialtyStrategy strategy = new SpecialtyStrategy();

        Technician tech1 = new Technician("Anand", "a@h.com", "p", "PLUMBING", 2, 10, 4.5);
        Technician tech2 = new Technician("Rajesh", "r@h.com", "p", "ELECTRICAL", 0, 15, 4.6);

        Complaint plumbingComplaint = Complaint.builder().category(Complaint.Category.PLUMBING).build();

        Technician selected = strategy.assign(plumbingComplaint, List.of(tech1, tech2));

        assertNotNull(selected);
        assertEquals("Anand", selected.getName(), "Should pick Anand because his specialty matches PLUMBING");
    }
}
