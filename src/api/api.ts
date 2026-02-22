import axios  from 'axios'



const baseUrl = "https://vk-backend-psi.vercel.app"

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