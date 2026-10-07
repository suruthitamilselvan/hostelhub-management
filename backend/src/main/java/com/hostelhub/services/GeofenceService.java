package com.hostelhub.services;

import org.springframework.stereotype.Service;

@Service
public class GeofenceService {

    /**
     * Checks if the client's IP address belongs to the registered hostel Wi-Fi network subnet.
     */
    public boolean isWithinHostelNetwork(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank()) {
            return true; // Default pass for localhost/demo
        }

        // Hostel Wi-Fi IP subnet prefixes
        return ipAddress.startsWith("192.168.1.") || 
               ipAddress.startsWith("10.0.0.") || 
               ipAddress.equals("127.0.0.1") || 
               ipAddress.equals("0:0:0:0:0:0:0:1");
    }
}
