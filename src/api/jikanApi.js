import axios from "axios";

const BASE_URL = "https://api.jikan.moe/v4";

const jikanApi = {
  getAnimeList: (params) => {
    // Fetch anime list, e.g., top anime or by genre
    return axios.get(`${BASE_URL}/anime`, { params });
  },
  getAnimationList: (params) => {
    // Jikan does not have a separate animation category, so we can filter by genre or type
    // For example, filter by genre "Animation" or type "movie"
    return axios.get(`${BASE_URL}/anime`, { params });
  },
  getAnimeById: (id) => {
    return axios.get(`${BASE_URL}/anime/${id}`);
  },
  searchAnime: (query, params) => {
    return axios.get(`${BASE_URL}/anime`, { params: { q: query, ...params } });
  },
};

export default jikanApi;
