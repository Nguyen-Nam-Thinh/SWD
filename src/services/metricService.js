// src/services/metricService.js
import api from "./api";

export const getMetrics = async () => {
    try {
        // Gọi API /api/Metrics như trong hình Swagger bạn cung cấp
        const response = await api.get("/Metrics");
        return response.data;
    } catch (error) {
        console.error("Error fetching metrics:", error);
        return [];
    }
};