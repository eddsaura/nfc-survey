import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useDeviceId } from "@/src/hooks/useDeviceId";
import { useSurveyStore } from "@/src/store/surveyStore";
import { Button } from "@/src/components/ui";
import { useColorScheme } from "@/components/useColorScheme";

type VoteStatus = "loading" | "voting" | "success" | "already_voted" | "error" | "invalid";

export default function VoteScreen() {
  const { surveyId, response } = useLocalSearchParams<{
    surveyId: string;
    response: string;
  }>();
  const { deviceId, isLoading: deviceIdLoading } = useDeviceId();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [status, setStatus] = useState<VoteStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const setCurrentVote = useSurveyStore((s) => s.setCurrentVote);

  const survey = useQuery(
    api.surveys.get,
    surveyId ? { id: surveyId as Id<"surveys"> } : "skip"
  );

  const hasVoted = useQuery(
    api.votes.hasVoted,
    surveyId && deviceId
      ? { surveyId: surveyId as Id<"surveys">, deviceId }
      : "skip"
  );

  const castVote = useMutation(api.votes.cast);

  const isValidResponse = response === "yes" || response === "no";

  useEffect(() => {
    if (!surveyId || !isValidResponse) {
      setStatus("invalid");
      setErrorMessage("Invalid survey link");
      return;
    }

    if (deviceIdLoading || survey === undefined || hasVoted === undefined) {
      setStatus("loading");
      return;
    }

    if (!survey) {
      setStatus("error");
      setErrorMessage("Survey not found");
      return;
    }

    if (!survey.isActive) {
      setStatus("error");
      setErrorMessage("This survey is no longer active");
      return;
    }

    if (hasVoted) {
      setStatus("already_voted");
      return;
    }

    async function submitVote() {
      if (!deviceId || !surveyId) return;

      setStatus("voting");

      try {
        const result = await castVote({
          surveyId: surveyId as Id<"surveys">,
          response: response as "yes" | "no",
          deviceId,
        });

        setCurrentVote({
          surveyId: surveyId as Id<"surveys">,
          voteId: result.voteId,
          response: response as "yes" | "no",
        });

        if (result.hasFollowUp) {
          router.replace(`/follow-up/${surveyId}`);
        } else {
          setStatus("success");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to register your vote"
        );
      }
    }

    submitVote();
  }, [
    surveyId,
    response,
    deviceId,
    deviceIdLoading,
    survey,
    hasVoted,
    castVote,
    setCurrentVote,
    isValidResponse,
  ]);

  const handleGoHome = () => {
    router.replace("/");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#F2F2F7" },
      ]}
    >
      {status === "loading" || status === "voting" ? (
        <Animated.View entering={FadeIn} style={styles.content}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.statusText, { color: isDark ? "#FFFFFF" : "#000000" }]}>
            {status === "loading" ? "Loading survey..." : "Registering your vote..."}
          </Text>
        </Animated.View>
      ) : status === "success" ? (
        <Animated.View entering={FadeInUp} style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✓</Text>
          </View>
          <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#000000" }]}>
            Thank You!
          </Text>
          <Text style={[styles.message, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
            Your vote has been recorded.
          </Text>
          <View style={styles.voteInfo}>
            <Text style={[styles.voteLabel, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
              You voted:
            </Text>
            <View
              style={[
                styles.voteBadge,
                {
                  backgroundColor:
                    response === "yes" ? "#34C759" : "#FF3B30",
                },
              ]}
            >
              <Text style={styles.voteText}>
                {response === "yes" ? "Yes" : "No"}
              </Text>
            </View>
          </View>
          <Button title="Done" onPress={handleGoHome} style={styles.button} />
        </Animated.View>
      ) : status === "already_voted" ? (
        <Animated.View entering={FadeInUp} style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: "#FF9500" }]}>
            <Text style={styles.icon}>!</Text>
          </View>
          <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#000000" }]}>
            Already Voted
          </Text>
          <Text style={[styles.message, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
            You have already submitted your vote for this survey.
          </Text>
          <Button title="Go Home" onPress={handleGoHome} style={styles.button} />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInUp} style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: "#FF3B30" }]}>
            <Text style={styles.icon}>✕</Text>
          </View>
          <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#000000" }]}>
            Oops!
          </Text>
          <Text style={[styles.message, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
            {errorMessage}
          </Text>
          <Button title="Go Home" onPress={handleGoHome} style={styles.button} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    fontSize: 40,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 16,
    marginTop: 16,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 280,
  },
  voteInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  voteLabel: {
    fontSize: 16,
  },
  voteBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  voteText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    marginTop: 24,
    minWidth: 200,
  },
});
