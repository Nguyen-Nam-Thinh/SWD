// src/services/auditLogService.js
import api from "./api"; // Import instance axios đã cấu hình của bạn

export const getAuditLogs = async (params) => {
    // params sẽ chứa: PageNumber, PageSize, SearchTerm, FromDate, ToDate, SortBy, IsDescending
    try {
        const response = await api.get("/AuditLogs", {
            params: params,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        throw error;
    }
};