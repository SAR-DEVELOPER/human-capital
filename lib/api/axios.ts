// lib/api/axios.ts
import axios from 'axios';

// Get the base URL from environment variables
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';

// Log the base URL for debugging
console.log('API Base URL:', baseURL);

export const api = axios.create({
  baseURL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000'),
  withCredentials: true, // Important for cookies/session handling
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});
