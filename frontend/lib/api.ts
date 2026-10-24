
import axios from "axios";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
