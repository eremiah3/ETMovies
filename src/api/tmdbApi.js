import axiosClient from "./axiosClient";

export const category = {
    movie: "movie",
    tv: "tv",
    animation: "animation",
    nollywood: "nollywood"
};

export const movieType = {
    upcoming: "upcoming",
    popular: "popular",
    top_rated: "top_rated",
};

export const tvType = {
    popular: "popular",
    top_rated: "top_rated",
    on_the_air: "on_the_air",
};

const tmdbApi = {
    getMoviesList: (type, params) => {
        const url = "movie/" + movieType[type];
        return axiosClient.get(url, { params });
    },
    getMoviesByGenre: (genreId, params) => {
        const url = "discover/movie";
        const newParams = { ...params, with_genres: genreId };
        return axiosClient.get(url, { params: newParams });
    },
    getMoviesByRegion: (region, params) => {
        const url = "discover/movie";
        const newParams = { ...params, region: region, with_original_language: 'en' };
        return axiosClient.get(url, { params: newParams });
    },
    getNollywoodMovies: (params) => {
        const url = "discover/movie";
        const newParams = {
            ...params,
            with_origin_country: 'NG',
            sort_by: 'popularity.desc'
        };
        return axiosClient.get(url, { params: newParams });
    },
    getTvList: (type, params) => {
        const url = "tv/" + tvType[type];
        return axiosClient.get(url, { params });
    },
    getVideos: (cate, id) => {
        const url = category[cate] + "/" + id + "/videos";
        return axiosClient.get(url, { params: {} });
    },
    search: (cate, params) => {
        const url = "search/" + category[cate];
        return axiosClient.get(url, { params });
    },
    detail: (cate, id, params) => {
        const url = category[cate] + "/" + id;
        return axiosClient.get(url, { params });
    },
    credits: (cate, id) => {
        const url = category[cate] + "/" + id + "/credits";
        return axiosClient.get(url, { params: {} });
    },
    similar: (cate, id) => {
        const url = category[cate] + "/" + id + "/similar";
        return axiosClient.get(url, { params: {} });
    },
    getSeasons: (tvId) => {
        const url = "tv/" + tvId;
        return axiosClient.get(url, { params: {} });
    },
    getEpisodes: (tvId, seasonNumber) => {
        const url = "tv/" + tvId + "/season/" + seasonNumber;
        return axiosClient.get(url, { params: {} });
    },
    find: (externalId, params) => {
        const url = "find/" + externalId;
        return axiosClient.get(url, { params });
    },
};

export default tmdbApi;
