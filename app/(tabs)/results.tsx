import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useQuery } from "convex/react";
import Animated, { FadeInUp } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/src/components/ui";
import { useColorScheme } from "@/components/useColorScheme";

export default function ResultsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedSurveyId, setSelectedSurveyId] = useState<Id<"surveys"> | null>(
    null
  );

  const surveys = useQuery(api.surveys.list);

  const results = useQuery(
    api.votes.getResults,
    selectedSurveyId ? { surveyId: selectedSurveyId } : "skip"
  );

  const followUpSummary = useQuery(
    api.followUp.getSummary,
    selectedSurveyId ? { surveyId: selectedSurveyId } : "skip"
  );

  const selectedSurvey = surveys?.find((s) => s._id === selectedSurveyId);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#F2F2F7" },
      ]}
      contentContainerStyle={styles.content}
    >
      <Animated.View entering={FadeInUp}>
        <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#000000" }]}>
          Survey Results
        </Text>

        {!surveys || surveys.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <FontAwesome
                name="bar-chart"
                size={48}
                color={isDark ? "#636366" : "#AEAEB2"}
              />
              <Text
                style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}
              >
                No Surveys Yet
              </Text>
              <Text
                style={[styles.emptyText, { color: isDark ? "#8E8E93" : "#6E6E73" }]}
              >
                Create a survey to start collecting responses
              </Text>
            </View>
          </Card>
        ) : (
          <View style={styles.surveyList}>
            {surveys.map((survey) => (
              <SurveyResultCard
                key={survey._id}
                surveyId={survey._id}
                title={survey.title}
                question={survey.question}
                isActive={survey.isActive}
                isSelected={selectedSurveyId === survey._id}
                onSelect={() =>
                  setSelectedSurveyId(
                    selectedSurveyId === survey._id ? null : survey._id
                  )
                }
                isDark={isDark}
              />
            ))}
          </View>
        )}
      </Animated.View>

      {selectedSurvey && results && (
        <Animated.View entering={FadeInUp.delay(100)}>
          <Card style={styles.resultsCard}>
            <Text
              style={[styles.resultsTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}
            >
              Vote Results
            </Text>
            <Text
              style={[
                styles.resultsQuestion,
                { color: isDark ? "#8E8E93" : "#6E6E73" },
              ]}
            >
              {selectedSurvey.question}
            </Text>

            <View style={styles.voteStats}>
              <View style={styles.voteStat}>
                <Text style={styles.voteCount}>{results.total}</Text>
                <Text
                  style={[
                    styles.voteLabel,
                    { color: isDark ? "#8E8E93" : "#6E6E73" },
                  ]}
                >
                  Total Votes
                </Text>
              </View>
            </View>

            <View style={styles.bars}>
              <View style={styles.barContainer}>
                <View style={styles.barLabelRow}>
                  <Text
                    style={[
                      styles.barLabel,
                      { color: isDark ? "#FFFFFF" : "#000000" },
                    ]}
                  >
                    Yes
                  </Text>
                  <Text
                    style={[
                      styles.barValue,
                      { color: isDark ? "#8E8E93" : "#6E6E73" },
                    ]}
                  >
                    {results.yes} ({results.yesPercentage.toFixed(1)}%)
                  </Text>
                </View>
                <View
                  style={[
                    styles.barTrack,
                    { backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA" },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${results.yesPercentage}%`,
                        backgroundColor: "#34C759",
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.barContainer}>
                <View style={styles.barLabelRow}>
                  <Text
                    style={[
                      styles.barLabel,
                      { color: isDark ? "#FFFFFF" : "#000000" },
                    ]}
                  >
                    No
                  </Text>
                  <Text
                    style={[
                      styles.barValue,
                      { color: isDark ? "#8E8E93" : "#6E6E73" },
                    ]}
                  >
                    {results.no} ({results.noPercentage.toFixed(1)}%)
                  </Text>
                </View>
                <View
                  style={[
                    styles.barTrack,
                    { backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA" },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${results.noPercentage}%`,
                        backgroundColor: "#FF3B30",
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>
      )}

      {selectedSurvey &&
        followUpSummary &&
        Object.keys(followUpSummary).length > 0 && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <Card style={styles.followUpCard}>
              <Text
                style={[
                  styles.resultsTitle,
                  { color: isDark ? "#FFFFFF" : "#000000" },
                ]}
              >
                Follow-up Responses
              </Text>

              {Object.entries(followUpSummary).map(([questionId, data]) => (
                <View key={questionId} style={styles.followUpQuestion}>
                  <Text
                    style={[
                      styles.followUpQuestionText,
                      { color: isDark ? "#FFFFFF" : "#000000" },
                    ]}
                  >
                    {data.question}
                  </Text>
                  <View style={styles.followUpAnswers}>
                    {Object.entries(data.answers)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([answer, count]) => (
                        <View key={answer} style={styles.followUpAnswer}>
                          <Text
                            style={[
                              styles.followUpAnswerText,
                              { color: isDark ? "#8E8E93" : "#6E6E73" },
                            ]}
                            numberOfLines={1}
                          >
                            {answer}
                          </Text>
                          <View
                            style={[
                              styles.followUpCount,
                              { backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.followUpCountText,
                                { color: isDark ? "#FFFFFF" : "#000000" },
                              ]}
                            >
                              {count}
                            </Text>
                          </View>
                        </View>
                      ))}
                  </View>
                </View>
              ))}
            </Card>
          </Animated.View>
        )}
    </ScrollView>
  );
}

function SurveyResultCard({
  surveyId,
  title,
  question,
  isActive,
  isSelected,
  onSelect,
  isDark,
}: {
  surveyId: Id<"surveys">;
  title: string;
  question: string;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  isDark: boolean;
}) {
  const results = useQuery(api.votes.getResults, { surveyId });

  return (
    <Pressable onPress={onSelect}>
      <Card
        style={{
          ...styles.surveyCard,
          ...(isSelected ? { borderColor: "#007AFF", borderWidth: 2 } : {}),
        }}
      >
        <View style={styles.surveyHeader}>
          <View style={styles.surveyTitleRow}>
            <Text
              style={[styles.surveyTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}
            >
              {title}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isActive ? "#34C759" : "#8E8E93" },
              ]}
            >
              <Text style={styles.statusText}>
                {isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.surveyQuestion,
              { color: isDark ? "#8E8E93" : "#6E6E73" },
            ]}
            numberOfLines={1}
          >
            {question}
          </Text>
        </View>

        {results && (
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text
                style={[
                  styles.quickStatValue,
                  { color: isDark ? "#FFFFFF" : "#000000" },
                ]}
              >
                {results.total}
              </Text>
              <Text
                style={[
                  styles.quickStatLabel,
                  { color: isDark ? "#8E8E93" : "#6E6E73" },
                ]}
              >
                votes
              </Text>
            </View>
            <View style={styles.miniBar}>
              <View
                style={[
                  styles.miniBarYes,
                  { width: `${results.yesPercentage}%` },
                ]}
              />
              <View
                style={[styles.miniBarNo, { width: `${results.noPercentage}%` }]}
              />
            </View>
          </View>
        )}

        <FontAwesome
          name={isSelected ? "chevron-up" : "chevron-down"}
          size={14}
          color={isDark ? "#636366" : "#AEAEB2"}
          style={styles.chevron}
        />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  surveyList: {
    gap: 12,
  },
  surveyCard: {
    padding: 16,
  },
  surveyHeader: {
    marginBottom: 12,
  },
  surveyTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  surveyQuestion: {
    fontSize: 14,
  },
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickStat: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  quickStatLabel: {
    fontSize: 12,
  },
  miniBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: "#E5E5EA",
  },
  miniBarYes: {
    backgroundColor: "#34C759",
  },
  miniBarNo: {
    backgroundColor: "#FF3B30",
  },
  chevron: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  resultsCard: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  resultsQuestion: {
    fontSize: 14,
    marginBottom: 16,
  },
  voteStats: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  voteStat: {
    alignItems: "center",
  },
  voteCount: {
    fontSize: 48,
    fontWeight: "700",
    color: "#007AFF",
  },
  voteLabel: {
    fontSize: 14,
  },
  bars: {
    gap: 16,
  },
  barContainer: {
    gap: 6,
  },
  barLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  barValue: {
    fontSize: 14,
  },
  barTrack: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },
  followUpCard: {
    padding: 16,
  },
  followUpQuestion: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  followUpQuestionText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  followUpAnswers: {
    gap: 6,
  },
  followUpAnswer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  followUpAnswerText: {
    fontSize: 14,
    flex: 1,
  },
  followUpCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 32,
    alignItems: "center",
  },
  followUpCountText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
