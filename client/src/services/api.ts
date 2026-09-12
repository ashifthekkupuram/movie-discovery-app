import axios from "axios";

import { getDeviceId } from "./deviceId";

const API_BASE_URL = "http://192.168.0.107:4000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const deviceId = await getDeviceId();
  config.headers["X-Device-Id"] = deviceId;
  return config;
});
