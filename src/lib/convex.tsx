import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { Platform } from "react-native";
import { storage } from "./secureStorage";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL!;

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider
      client={convex}
      storage={storage}
      replaceURL={Platform.OS === "web" ? replaceURL : undefined}
    >
      {children}
    </ConvexAuthProvider>
  );
}

function replaceURL(url: string) {
  window.history.replaceState({}, "", url);
}

export { convex };
