import { Platform } from "react-native";

interface TokenStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const createSecureStorage = (): TokenStorage => {
  if (Platform.OS === "web") {
    return {
      getItem: async (key: string) => {
        return localStorage.getItem(key);
      },
      setItem: async (key: string, value: string) => {
        localStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        localStorage.removeItem(key);
      },
    };
  }

  // Native platforms use expo-secure-store
  const SecureStore = require("expo-secure-store");
  return {
    getItem: async (key: string) => {
      return await SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string) => {
      await SecureStore.setItemAsync(key, value);
    },
    removeItem: async (key: string) => {
      await SecureStore.deleteItemAsync(key);
    },
  };
};

export const storage = createSecureStorage();
