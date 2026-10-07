import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes("/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

export function errorMessage(err) {
  if (!err.response) return "Cannot reach the server";
  const d = err.response.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    return d.map((e) => `${e.loc?.slice(-1)[0]}: ${e.msg}`).join(", ");
  }
  return "Something went wrong";
}