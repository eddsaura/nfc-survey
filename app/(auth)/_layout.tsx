import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: isDark ? "#000000" : "#F2F2F7" }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
