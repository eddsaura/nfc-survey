import React from "react";
import { Pressable, StyleSheet, View, ActivityIndicator } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, Redirect } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useAuth } from "@/src/hooks/useAuth";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

function SignOutButton() {
  const { isAuthenticated, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Pressable onPress={signOut} style={styles.signOutButton}>
      <FontAwesome name="sign-out" size={20} color={isDark ? "#FFFFFF" : "#007AFF"} />
    </Pressable>
  );
}

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? "#000000" : "#F2F2F7" }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: true,
        headerRight: () => <SignOutButton />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="write-tag"
        options={{
          title: "Write Tag",
          tabBarIcon: ({ color }) => <TabBarIcon name="wifi" color={color} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: "Results",
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  signOutButton: {
    marginRight: 16,
    padding: 8,
  },
});
