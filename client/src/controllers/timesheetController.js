import axios from "axios";
const API_URL = "http://localhost:5000/api/timesheet";

export const getTimesheet = async (employeeName, month, year) => {
    const res = await axios.get(`${API_URL}?employeeName=${employeeName}&month=${month}&year=${year}`);
    return res.data;
};

export const addTask = async (employeeName, month, year, task) => {
    const res = await axios.post(`${API_URL}/add-task`, { employeeName, month, year, task });
    return res.data;
};

export const updateTask = async (timesheetId, taskId, updatedTask) => {
    const res = await axios.put(`${API_URL}/update-task`, { timesheetId, taskId, updatedTask });
    return res.data;
};

export const deleteTask = async (timesheetId, taskId) => {
    const res = await axios.delete(`${API_URL}/delete-task`, { data: { timesheetId, taskId } });
    return res.data;
};
