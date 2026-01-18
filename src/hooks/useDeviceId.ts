import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "@nfc_surveys_device_id";
const WEB_DEVICE_ID_KEY = "nfc_surveys_device_id";

const isWeb = Platform.OS === "web";

function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrCreateDeviceId() {
      try {
        let storedId: string | null = null;

        if (isWeb && typeof window !== "undefined") {
          storedId = localStorage.getItem(WEB_DEVICE_ID_KEY);
          if (!storedId) {
            storedId = generateDeviceId();
            localStorage.setItem(WEB_DEVICE_ID_KEY, storedId);
          }
        } else {
          storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);
          if (!storedId) {
            storedId = generateDeviceId();
            await AsyncStorage.setItem(DEVICE_ID_KEY, storedId);
          }
        }

        setDeviceId(storedId);
      } catch (error) {
        console.error("Failed to load device ID:", error);
        const fallbackId = generateDeviceId();
        setDeviceId(fallbackId);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrCreateDeviceId();
  }, []);

  return { deviceId, isLoading };
}

export async function getDeviceId(): Promise<string> {
  try {
    if (isWeb && typeof window !== "undefined") {
      let storedId = localStorage.getItem(WEB_DEVICE_ID_KEY);
      if (!storedId) {
        storedId = generateDeviceId();
        localStorage.setItem(WEB_DEVICE_ID_KEY, storedId);
      }
      return storedId;
    }

    let storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (!storedId) {
      storedId = generateDeviceId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, storedId);
    }

    return storedId;
  } catch {
    return generateDeviceId();
  }
}
