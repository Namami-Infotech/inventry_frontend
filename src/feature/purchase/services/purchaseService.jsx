import axios from "axios";
import { API_BASE_URL } from "../../../services/apiConfig.js";

const BASE_URL = `${API_BASE_URL}/api/purchases`;

export const getPurchases = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(BASE_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getPurchaseById = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getNextPurchaseNumber = async () => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/next-number`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const createPurchase = async (data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(`${BASE_URL}/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

// Aliases for legacy hooks
export const createPurchaseOrder = createPurchase;
export const getPurchaseOrders = getPurchases;
export const getPurchaseOrderById = getPurchaseById;

export const receivePurchase = async (id, data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(`${BASE_URL}/${id}/receive`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const cancelPurchase = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(`${BASE_URL}/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};