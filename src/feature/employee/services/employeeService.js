import axios from "axios";
import { API_BASE_URL } from "../../../services/apiConfig.js";

const BASE_URL = `${API_BASE_URL}/api/employees`;

export const getEmployees = async (params = {}) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(BASE_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

// Aliases for legacy hooks
export const getAllEmployees = getEmployees;

export const getEmployeesByRole = async (roleName) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/by-role/${roleName}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getNextEmployeeCode = async () => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/next-code`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const getRoles = async () => {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${BASE_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const createEmployee = async (employeeData) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(`${BASE_URL}/add`, employeeData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const updateEmployee = async (id, employeeData) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(`${BASE_URL}/${id}`, employeeData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const updateEmployeeStatus = async (id, status) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(`${BASE_URL}/${id}/status`, { employee_status: status }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};

export const toggleEmployeeStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return updateEmployeeStatus(id, newStatus);
};

export const deleteEmployee = async (id) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return response.data;
};