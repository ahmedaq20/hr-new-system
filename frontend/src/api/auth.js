// import api from "./api";
import { API_BASE_URL } from "../config/api";

// export const login = (email, password) => {
//   return api.post("/login", {
//     national_id,
//     password,
//   });
// };

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  return response;
};
