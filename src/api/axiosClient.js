import axios from "axios";
import queryString from "query-string";

import apiConfig from "./apiConfig";

const axiosClient = axios.create({
  baseURL: apiConfig.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) =>
    queryString.stringify({ ...params, api_key: apiConfig.apiKey }),
});

axiosClient.interceptors.request.use(async (config) => config);

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }

    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`API Error ${error.response.status}:`, {
        status: error.response.status,
        data: error.response.data,
        config: error.config
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response from server:", error.request);
    } else {
      // Other errors
      console.error("Error:", error.message);
    }
    throw error;
  }
);

export default axiosClient;
