import axios from "axios";
import { API_BASE_URL } from "../../../services/apiConfig.js";

const BASE_URL = `${API_BASE_URL}/api/reports`;

export const getDashboardStats = async () => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getProjectsReport = async () => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getMachineReport = async () => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/machines`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getDailyStockReport = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/daily-stock`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const saveMonthOpeningStock = async (data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(`${BASE_URL}/month-opening-stock`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const savePdiRejection = async (data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(`${BASE_URL}/pdi-rejection`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getPdiRejections = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/pdi-rejections`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const deletePdiRejection = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.delete(`${BASE_URL}/pdi-rejection/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

