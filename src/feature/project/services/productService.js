import axios from "axios";
import { API_BASE_URL } from "../../../services/apiConfig.js";

const BASE_URL = `${API_BASE_URL}/api/products`;

const getAuthHeader = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProducts = async (params = {}) => {
    const response = await axios.get(BASE_URL, {
        params,
        headers: getAuthHeader(),
        withCredentials: true
    });
    return response.data;
};

export const getProductById = async (id) => {
    const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: getAuthHeader(),
        withCredentials: true
    });
    return response.data;
};

export const createProduct = async (data) => {
    const response = await axios.post(`${BASE_URL}/add`, data, {
        headers: getAuthHeader(),
        withCredentials: true
    });
    return response.data;
};

export const updateProduct = async (id, data) => {
    const response = await axios.put(`${BASE_URL}/${id}`, data, {
        headers: getAuthHeader(),
        withCredentials: true
    });
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: getAuthHeader(),
        withCredentials: true
    });
    return response.data;
};
