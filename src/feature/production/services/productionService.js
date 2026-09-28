import axios from "axios";
import { API_BASE_URL } from "../../../services/apiConfig.js";

const BASE_URL = `${API_BASE_URL}/api/production`;

export const getProductions = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(BASE_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getProductionById = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getPlanningForProduction = async (planningId) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/planning-prefill/${planningId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getDispatchedRequestsForProduction = async () => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${API_BASE_URL}/api/material-requests/dispatched-for-production`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getNextProductionCode = async () => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/next-code`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const createProduction = async (data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(`${BASE_URL}/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const cancelProduction = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(`${BASE_URL}/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};
