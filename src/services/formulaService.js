// src/services/formulaService.js
import api from "./api"; // Sử dụng axios instance đã cấu hình

const ENDPOINT = "/Formulas";

export const getFormulas = async () => {
    const response = await api.get(ENDPOINT);
    return response.data;
};

export const createFormula = async (data) => {
    // data khớp với CreateFormulaRequest trong C#
    const response = await api.post(ENDPOINT, data);
    return response.data;
};

export const updateFormula = async (id, data) => {
    // data khớp với UpdateFormulaRequest trong C#
    // Lưu ý: API PUT yêu cầu gửi đầy đủ thông tin (Name, Expression, Tolerance, Active)
    const response = await api.put(`${ENDPOINT}/${id}`, data);
    return response.data;
};

export const deleteFormula = async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
};