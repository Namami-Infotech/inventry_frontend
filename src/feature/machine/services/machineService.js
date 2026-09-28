import axios from "axios";
import { API_BASE_URL } from "../../../services/apiConfig.js";

const BASE_URL = `${API_BASE_URL}/api/machines`;

export const getMachines = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(BASE_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getMachineById = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getNextMachineCode = async () => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/next-code`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const createMachine = async (data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(`${BASE_URL}/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const updateMachine = async (id, data) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(`${BASE_URL}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const deleteMachine = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};
