import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import Animated, { FadeInUp } from "react-native-reanimated";

import { api } from "@/convex/_generated/api";
import { Card } from "@/src/components/ui";
import { useColorScheme } from "@/components/useColorScheme";

export default function ResultsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const surveys = useQuery(api.surveys.listMineWithResults);

  if (surveys === undefined) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? "#000000" : "#F2F2F7" }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (surveys.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? "#000000" : "#F2F2F7" }]}>
        <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>
          No Surveys Yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
          Create a survey to start collecting votes
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? "#000000" : "#F2F2F7" }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.header, { color: isDark ? "#FFFFFF" : "#000000" }]}>
        Your Surveys
      </Text>

      {surveys.map((survey, index) => (
        <Animated.View key={survey._id} entering={FadeInUp.delay(index * 50)}>
          <Card style={styles.surveyCard}>
            <View style={styles.surveyHeader}>
              <Text style={[styles.surveyTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>
                {survey.title}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: survey.isActive ? "#34C75920" : "#FF3B3020" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: survey.isActive ? "#34C759" : "#FF3B30" },
                  ]}
                >
                  {survey.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>

            <Text
              style={[styles.surveyQuestion, { color: isDark ? "#8E8E93" : "#6E6E73" }]}
              numberOfLines={2}
            >
              {survey.question}
            </Text>

            {survey.results.total > 0 ? (
              <>
                <View style={styles.voteBar}>
                  <View
                    style={[
                      styles.yesBar,
                      { width: `${survey.results.yesPercentage}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.noBar,
                      { width: `${survey.results.noPercentage}%` },
                    ]}
                  />
                </View>

                <View style={styles.voteStats}>
                  <View style={styles.voteStat}>
                    <View style={[styles.voteDot, { backgroundColor: "#34C759" }]} />
                    <Text style={[styles.voteLabel, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
                      Yes
                    </Text>
                    <Text style={[styles.voteCount, { color: isDark ? "#FFFFFF" : "#000000" }]}>
                      {survey.results.yes}
                    </Text>
                    <Text style={[styles.votePercentage, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
                      ({survey.results.yesPercentage.toFixed(0)}%)
                    </Text>
                  </View>

                  <View style={styles.voteStat}>
                    <View style={[styles.voteDot, { backgroundColor: "#FF3B30" }]} />
                    <Text style={[styles.voteLabel, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
                      No
                    </Text>
                    <Text style={[styles.voteCount, { color: isDark ? "#FFFFFF" : "#000000" }]}>
                      {survey.results.no}
                    </Text>
                    <Text style={[styles.votePercentage, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
                      ({survey.results.noPercentage.toFixed(0)}%)
                    </Text>
                  </View>
                </View>

                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
                    Total Votes
                  </Text>
                  <Text style={[styles.totalCount, { color: isDark ? "#FFFFFF" : "#000000" }]}>
                    {survey.results.total}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.noVotes}>
                <Text style={[styles.noVotesText, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
                  No votes yet
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  surveyCard: {
    padding: 16,
    gap: 12,
  },
  surveyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  surveyQuestion: {
    fontSize: 14,
    lineHeight: 20,
  },
  voteBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E5EA",
    overflow: "hidden",
  },
  yesBar: {
    backgroundColor: "#34C759",
    height: "100%",
  },
  noBar: {
    backgroundColor: "#FF3B30",
    height: "100%",
  },
  voteStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  voteStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  voteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  voteLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  voteCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  votePercentage: {
    fontSize: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#3C3C4330",
  },
  totalLabel: {
    fontSize: 14,
  },
  totalCount: {
    fontSize: 16,
    fontWeight: "600",
  },
  noVotes: {
    paddingVertical: 16,
    alignItems: "center",
  },
  noVotesText: {
    fontSize: 14,
    fontStyle: "italic",
  },
});
