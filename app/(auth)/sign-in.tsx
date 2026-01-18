import { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "@/src/hooks/useAuth";
import { useColorScheme } from "@/components/useColorScheme";
import { Card, Button } from "@/src/components/ui";

export default function SignInScreen() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (error) {
      Alert.alert(
        "Authentication Error",
        error instanceof Error ? error.message : "Failed to authenticate"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? "#000000" : "#F2F2F7" }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <FontAwesome name="wifi" size={48} color="#007AFF" />
          </View>
          <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#000000" }]}>
            NFC Surveys
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
            Create and manage surveys with NFC tags
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.signInTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>
            {isSignUp ? "Create an account" : "Sign in to continue"}
          </Text>
          <Text style={[styles.signInSubtitle, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
            {isSignUp ? "Sign up to create and manage your surveys" : "Sign in to create and manage your surveys"}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
                color: isDark ? "#FFFFFF" : "#000000",
              },
            ]}
            placeholder="Email"
            placeholderTextColor={isDark ? "#636366" : "#8E8E93"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
                color: isDark ? "#FFFFFF" : "#000000",
              },
            ]}
            placeholder="Password"
            placeholderTextColor={isDark ? "#636366" : "#8E8E93"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <Button
            title={isSignUp ? "Sign Up" : "Sign In"}
            onPress={handleEmailAuth}
            loading={isSubmitting}
            size="large"
          />

          <Pressable onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleMode}>
            <Text style={[styles.toggleModeText, { color: "#007AFF" }]}>
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? "#3A3A3C" : "#E5E5EA" }]} />
            <Text style={[styles.dividerText, { color: isDark ? "#636366" : "#8E8E93" }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? "#3A3A3C" : "#E5E5EA" }]} />
          </View>

          <Pressable
            style={[styles.googleButton, { backgroundColor: isDark ? "#2C2C2E" : "#FFFFFF" }]}
            onPress={signInWithGoogle}
          >
            <FontAwesome name="google" size={20} color="#4285F4" />
            <Text style={[styles.googleButtonText, { color: isDark ? "#FFFFFF" : "#000000" }]}>
              Continue with Google
            </Text>
          </Pressable>
        </Card>

        <View style={styles.footer}>
          <FontAwesome name="info-circle" size={16} color={isDark ? "#636366" : "#AEAEB2"} />
          <Text style={[styles.footerText, { color: isDark ? "#636366" : "#AEAEB2" }]}>
            Voting on surveys doesn't require sign-in
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  card: {
    padding: 24,
  },
  signInTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  signInSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  toggleMode: {
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleModeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.2)",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
});
