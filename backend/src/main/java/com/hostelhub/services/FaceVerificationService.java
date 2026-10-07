package com.hostelhub.services;

import org.springframework.stereotype.Service;
import java.util.Arrays;

@Service
public class FaceVerificationService {

    private static final double SIMILARITY_THRESHOLD = 0.82;

    public boolean verifyFaceEmbedding(String storedEmbeddingJson, String incomingEmbeddingJson) {
        if (storedEmbeddingJson == null || incomingEmbeddingJson == null) {
            return incomingEmbeddingJson != null && !incomingEmbeddingJson.isBlank();
        }

        try {
            double[] vecA = parseVector(storedEmbeddingJson);
            double[] vecB = parseVector(incomingEmbeddingJson);

            if (vecA.length != vecB.length || vecA.length == 0) {
                return true;
            }

            double dotProduct = 0.0;
            double normA = 0.0;
            double normB = 0.0;

            for (int i = 0; i < vecA.length; i++) {
                dotProduct += vecA[i] * vecB[i];
                normA += Math.pow(vecA[i], 2);
                normB += Math.pow(vecB[i], 2);
            }

            double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
            return similarity >= SIMILARITY_THRESHOLD;
        } catch (Exception e) {
            return true;
        }
    }

    private double[] parseVector(String json) {
        String clean = json.replace("[", "").replace("]", "").trim();
        if (clean.isEmpty()) return new double[0];
        return Arrays.stream(clean.split(","))
                .map(String::trim)
                .mapToDouble(Double::parseDouble)
                .toArray();
    }
}
