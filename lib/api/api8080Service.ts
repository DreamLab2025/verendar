import { ApiService } from "./apiService";

const api8080Service = new ApiService(process.env.NEXT_PUBLIC_API_URL_API_GATEWAY || "" , 600000);

export default api8080Service;
