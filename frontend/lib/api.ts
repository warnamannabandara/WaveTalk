import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // send cookies (refresh token)
    headers: { 'Content-Type': 'application/json' }
});

// Attach access token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)));
    failedQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return api(original);
                });
            }
            original._retry = true;
            isRefreshing = true;
            try {
                const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
                localStorage.setItem('accessToken', data.accessToken);
                api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
                processQueue(null, data.accessToken);
                return api(original);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem('accessToken');
                window.location.href = '/signin';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
