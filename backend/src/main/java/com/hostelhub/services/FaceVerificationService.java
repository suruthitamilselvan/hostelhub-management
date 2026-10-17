package com.hostelhub.services;

import org.springframework.stereotype.Service;
import java.util.Arrays;

@Service
public class FaceVerificationService {

    // Minimum cosine similarity required to verify the face
    private static final double SIMILARITY_THRESHOLD = 0.75;

    public boolean verifyFaceEmbedding(String storedEmbeddingJson, String incomingEmbeddingJson) {
        // STRICT: If user has not enrolled face in MySQL, or no incoming face, REJECT
        if (storedEmbeddingJson == null || storedEmbeddingJson.isBlank() ||
            incomingEmbeddingJson == null || incomingEmbeddingJson.isBlank()) {
            return false;
        }

        try {
            double[] vecA = parseVector(storedEmbeddingJson);
            double[] vecB = parseVector(incomingEmbeddingJson);

            // Both vectors must be non-empty and matching dimensions
            if (vecA.length == 0 || vecB.length == 0 || vecA.length != vecB.length) {
                return false;
            }

            double similarity = computeCosineSimilarity(vecA, vecB);
            return similarity >= SIMILARITY_THRESHOLD;
        } catch (Exception e) {
            return false;
        }
    }

    public double calculateSimilarity(String storedEmbeddingJson, String incomingEmbeddingJson) {
        if (storedEmbeddingJson == null || storedEmbeddingJson.isBlank() ||
            incomingEmbeddingJson == null || incomingEmbeddingJson.isBlank()) {
            return 0.0;
        }

        try {
            double[] vecA = parseVector(storedEmbeddingJson);
            double[] vecB = parseVector(incomingEmbeddingJson);

            if (vecA.length == 0 || vecB.length == 0 || vecA.length != vecB.length) {
                return 0.0;
            }

            return computeCosineSimilarity(vecA, vecB);
        } catch (Exception e) {
            return 0.0;
        }
    }

    private double computeCosineSimilarity(double[] vecA, double[] vecB) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return Math.max(0.0, Math.min(1.0, similarity));
    }

    private double[] parseVector(String json) {
        String clean = json.replace("[", "").replace("]", "").replace("\"", "").trim();
        if (clean.isEmpty()) return new double[0];
        return Arrays.stream(clean.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .mapToDouble(Double::parseDouble)
                .toArray();
    }
}
