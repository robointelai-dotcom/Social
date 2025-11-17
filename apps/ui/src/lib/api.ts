import axios from "axios";

const api = axios.create({
  baseURL: `${window.location.origin}/api/v1`,
  withCredentials: true,
});

export default api;
