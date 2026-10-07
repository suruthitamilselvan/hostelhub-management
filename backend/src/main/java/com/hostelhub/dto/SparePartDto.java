package com.hostelhub.dto;

public class SparePartDto {
    private String partName;
    private int quantity;
    private double unitCost;

    public SparePartDto() {}

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getUnitCost() { return unitCost; }
    public void setUnitCost(double unitCost) { this.unitCost = unitCost; }
}
