package com.hostelhub.services;

import org.springframework.stereotype.Service;
import java.util.Arrays;

@Service
public class FaceVerificationService {

    // Minimum cosine similarity required to verify the face (65% calibrated for shift-tolerant 128D facial vectors)
    private static final double SIMILARITY_THRESHOLD = 0.65;

    public boolean verifyFaceEmbedding(String storedEmbeddingJson, String incomingEmbeddingJson) {
        if (storedEmbeddingJson == null || storedEmbeddingJson.isBlank() ||
            incomingEmbeddingJson == null || incomingEmbeddingJson.isBlank()) {
            return false;
        }

        try {
            double[] vecA = parseVector(storedEmbeddingJson);
            double[] vecB = parseVector(incomingEmbeddingJson);

            if (vecA.length == 0 || vecB.length == 0 || vecA.length != vecB.length) {
                return false;
            }

            double similarity = calculateSimilarityInternal(vecA, vecB);
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

            return calculateSimilarityInternal(vecA, vecB);
        } catch (Exception e) {
            return 0.0;
        }
    }

    private double calculateSimilarityInternal(double[] vecA, double[] vecB) {
        // 1. Direct cosine similarity
        double directSim = computeCosineSimilarity(vecA, vecB);

        // 2. If 128D (64 contrast + 64 edge density from 8x8 grid), compute shift-tolerant correlation
        if (vecA.length == 128 && vecB.length == 128) {
            double shiftSim = computeSpatialShiftSimilarity(vecA, vecB);
            return Math.max(directSim, shiftSim);
        }

        return directSim;
    }

    private double computeSpatialShiftSimilarity(double[] vecA, double[] vecB) {
        double bestSim = 0.0;
        int grid = 8;

        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                double dot = 0.0;
                double normA = 0.0;
                double normB = 0.0;

                int rAStart = Math.max(0, -dr);
                int rAEnd = Math.min(grid, grid - dr);
                int rBStart = Math.max(0, dr);

                int cAStart = Math.max(0, -dc);
                int cAEnd = Math.min(grid, grid - dc);
                int cBStart = Math.max(0, dc);

                for (int r = 0; r < (rAEnd - rAStart); r++) {
                    int rA = rAStart + r;
                    int rB = rBStart + r;

                    for (int c = 0; c < (cAEnd - cAStart); c++) {
                        int cA = cAStart + c;
                        int cB = cBStart + c;

                        int idxA_c = rA * grid + cA;
                        int idxB_c = rB * grid + cB;
                        int idxA_e = 64 + idxA_c;
                        int idxB_e = 64 + idxB_c;

                        dot += vecA[idxA_c] * vecB[idxB_c] + vecA[idxA_e] * vecB[idxB_e];
                        normA += vecA[idxA_c] * vecA[idxA_c] + vecA[idxA_e] * vecA[idxA_e];
                        normB += vecB[idxB_c] * vecB[idxB_c] + vecB[idxB_e] * vecB[idxB_e];
                    }
                }

                if (normA > 0 && normB > 0) {
                    double sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
                    if (sim > bestSim) {
                        bestSim = sim;
                    }
                }
            }
        }

        return Math.max(0.0, Math.min(1.0, bestSim));
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
