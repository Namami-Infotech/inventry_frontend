import axios from "axios";
import { API_BASE_URL } from "../../../services/apiConfig.js";

const BASE_URL = `${API_BASE_URL}/api/delivery`;

export const getDeliveries = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(BASE_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getDeliveryById = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getEligibleProjectsForDelivery = async () => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/eligible-projects`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getProjectForDelivery = async (projectId) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/project-prefill/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getNextDeliveryNumber = async () => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/next-number`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const createDelivery = async (data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(`${BASE_URL}/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const cancelDelivery = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(`${BASE_URL}/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};
