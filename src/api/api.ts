import axios  from 'axios'


const baseUrl = import.meta.env.VITE_API_URL

// const baseUrl = "http://localhost:8000/api/v1/"

const API = axios.create( {
    baseURL: baseUrl
})


API.interceptors.request.use((config:any) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // now token exists
  }
  return config;
});

export default API