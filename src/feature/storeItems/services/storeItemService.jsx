import axios from "axios";
import { API_BASE_URL } from "../../../services/apiConfig.js";

const BASE_URL = `${API_BASE_URL}/api/store`;

export const getStoreItems = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(BASE_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

// Aliases for legacy hooks
export const getAllStoreItems = getStoreItems;

export const getRawMaterials = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/raw-materials`, {
        params: { all: true, ...params, item_type: 'raw_material' },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getFinishedGoods = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/finished-goods`, {
        params: { all: true, ...params, item_type: 'finished_good' },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getStockTransactions = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/transactions`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const createStoreItem = async (data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(`${BASE_URL}/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const updateStoreItem = async (id, data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(`${BASE_URL}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const adjustStock = async (id, data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(`${BASE_URL}/${id}/adjust`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const deleteStoreItem = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};