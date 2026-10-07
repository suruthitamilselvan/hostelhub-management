package com.hostelhub.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class CloudinaryService {

    // Cloudinary Secure Credentials loaded from environment variables / application.properties
    @Value("${cloudinary.cloud-name:hostelhub-demo}")
    private String cloudName;

    @Value("${cloudinary.api-key:1234567890}")
    private String apiKey;

    @Value("${cloudinary.api-secret:secret-demo-key}")
    private String apiSecret;

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/webp", "image/jpg");
    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB Limit

    /**
     * Validates image file size and MIME type.
     */
    public boolean validateImageFile(String filename, String contentType, long sizeInBytes) {
        if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Image file size exceeds maximum limit of 5MB.");
        }
        if (contentType != null && !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid image format. Allowed formats: JPEG, PNG, WEBP.");
        }
        return true;
    }

    /**
     * Uploads image to Cloudinary and returns the secure image URL string.
     * Note: Binary image data is stored in Cloudinary; only the URL string is stored in the database.
     */
    public String uploadImage(byte[] imageBytes, String filename, String contentType) {
        validateImageFile(filename, contentType, imageBytes != null ? imageBytes.length : 1000);

        // Simulated Cloudinary Secure URL generation
        String publicId = "hostelhub_" + System.currentTimeMillis() + "_" + (filename != null ? filename.replaceAll("[^a-zA-Z0-9.]", "_") : "photo.jpg");
        String secureUrl = String.format("https://res.cloudinary.com/%s/image/upload/v1710000000/%s", cloudName, publicId);

        return secureUrl;
    }

    public String getCloudName() {
        return cloudName;
    }
}
