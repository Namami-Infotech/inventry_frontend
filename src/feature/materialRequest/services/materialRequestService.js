import axios from "axios";
import { API_BASE_URL } from "../../../services/apiConfig.js";

const BASE_URL = `${API_BASE_URL}/api/material-requests`;

export const getMaterialRequests = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(BASE_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getMaterialRequestById = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const createMaterialRequest = async (data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(`${BASE_URL}/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const cancelMaterialRequest = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(`${BASE_URL}/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};
