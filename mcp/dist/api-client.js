import axios from "axios";
const BASE_URL = process.env.API_C_URL || "http://localhost:3000";
class ApiClient {
    client;
    token = null;
    constructor() {
        this.client = axios.create({ baseURL: BASE_URL });
        this.client.interceptors.request.use((config) => {
            if (this.token) {
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        });
    }
    login(email, password) {
        return this.post("/auth/login", { email, password });
    }
    register(email, password) {
        return this.post("/auth/register", { email, password });
    }
    setToken(token) {
        this.token = token;
    }
    clearToken() {
        this.token = null;
    }
    getToken() {
        return this.token;
    }
    isAuthenticated() {
        return this.token !== null;
    }
    async autoLogin() {
        const email = process.env.API_C_EMAIL;
        const password = process.env.API_C_PASSWORD;
        if (!email || !password) {
            return false;
        }
        try {
            const res = await this.login(email, password);
            this.setToken(res.access_token);
            return true;
        }
        catch {
            return false;
        }
    }
    async get(path, config) {
        const res = await this.client.get(path, config);
        return res.data;
    }
    async post(path, data) {
        const res = await this.client.post(path, data);
        return res.data;
    }
    async put(path, data) {
        const res = await this.client.put(path, data);
        return res.data;
    }
    async patch(path, data) {
        const res = await this.client.patch(path, data);
        return res.data;
    }
    async del(path, config) {
        const res = await this.client.delete(path, config);
        return res.data;
    }
}
export const api = new ApiClient();
