// lib/api/index.ts
// Export API client with interceptors configured
import { api } from './axios';
import './interceptors'; // This will set up the interceptors

export { api };
export default api;
