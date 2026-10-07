package com.hostelhub.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "spare_parts")
public class SparePart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id")
    @JsonIgnore
    private Complaint complaint;

    @Column(nullable = false)
    private String partName;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private double unitCost;

    @Column(nullable = false)
    private double lineTotal;

    public SparePart() {}

    public SparePart(Long id, Complaint complaint, String partName, int quantity, double unitCost, double lineTotal) {
        this.id = id;
        this.complaint = complaint;
        this.partName = partName;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.lineTotal = lineTotal;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getUnitCost() { return unitCost; }
    public void setUnitCost(double unitCost) { this.unitCost = unitCost; }

    public double getLineTotal() { return lineTotal; }
    public void setLineTotal(double lineTotal) { this.lineTotal = lineTotal; }

    public static SparePartBuilder builder() {
        return new SparePartBuilder();
    }

    public static class SparePartBuilder {
        private Long id;
        private Complaint complaint;
        private String partName;
        private int quantity;
        private double unitCost;
        private double lineTotal;

        public SparePartBuilder id(Long id) { this.id = id; return this; }
        public SparePartBuilder complaint(Complaint complaint) { this.complaint = complaint; return this; }
        public SparePartBuilder partName(String partName) { this.partName = partName; return this; }
        public SparePartBuilder quantity(int quantity) { this.quantity = quantity; return this; }
        public SparePartBuilder unitCost(double unitCost) { this.unitCost = unitCost; return this; }
        public SparePartBuilder lineTotal(double lineTotal) { this.lineTotal = lineTotal; return this; }

        public SparePart build() {
            return new SparePart(id, complaint, partName, quantity, unitCost, lineTotal);
        }
    }
}
