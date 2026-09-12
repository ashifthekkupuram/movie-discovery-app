import axios from "axios";

import { getDeviceId } from "./deviceId";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_URL - check your .env file");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const deviceId = await getDeviceId();
  config.headers["X-Device-Id"] = deviceId;
  return config;
});
