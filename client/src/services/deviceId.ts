import { getItemAsync, setItemAsync } from "expo-secure-store";
import { randomUUID } from "expo-crypto";

const DEVICE_ID_KEY = "movie-discovery-device-id";

export const getDeviceId = async () => {
  let deviceId = await getItemAsync(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = randomUUID();
    await setItemAsync(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
};
