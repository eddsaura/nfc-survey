import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { useNfc } from "@/src/hooks/useNfc";
import { Button, Card } from "@/src/components/ui";
import { useColorScheme } from "@/components/useColorScheme";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { status: nfcStatus, readTag, isReading, cancelRead } = useNfc();
  const [scanError, setScanError] = useState<string | null>(null);

  const surveys = useQuery(api.surveys.list);
  const activeSurveys = surveys?.filter((s) => s.isActive) ?? [];

  const handleScanTag = async () => {
    if (!nfcStatus.isSupported) {
      Alert.alert(
        "NFC Not Supported",
        "This device does not support NFC scanning."
      );
      return;
    }

    if (!nfcStatus.isEnabled) {
      Alert.alert(
        "NFC Disabled",
        "Please enable NFC in your device settings to scan tags."
      );
      return;
    }

    setScanError(null);

    try {
      const result = await readTag();

      if (result) {
        router.push(`/survey/${result.surveyId}/${result.response}`);
      } else {
        setScanError("Could not read survey data from tag. Try again.");
      }
    } catch (error) {
      setScanError(
        error instanceof Error ? error.message : "Failed to read tag"
      );
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#F2F2F7" },
      ]}
      contentContainerStyle={styles.content}
    >
      <View>
        <Card style={styles.heroCard}>
          <Text style={[styles.heroTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>
            NFC Surveys
          </Text>
          <Text style={[styles.heroSubtitle, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
            Tap an NFC tag to vote, or create your own surveys
          </Text>

          <View style={styles.scanSection}>
            {isReading ? (
              <>
                <View style={styles.scanningIndicator}>
                  <Text style={styles.scanningIcon}>📡</Text>
                  <Text
                    style={[
                      styles.scanningText,
                      { color: isDark ? "#FFFFFF" : "#000000" },
                    ]}
                  >
                    Ready to scan...
                  </Text>
                  <Text
                    style={[
                      styles.scanningHint,
                      { color: isDark ? "#8E8E93" : "#6E6E73" },
                    ]}
                  >
                    Hold your device near an NFC tag
                  </Text>
                </View>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={cancelRead}
                />
              </>
            ) : (
              <Button
                title="Scan NFC Tag"
                onPress={handleScanTag}
                size="large"
                disabled={!nfcStatus.isSupported}
              />
            )}

            {scanError && (
              <Text style={styles.errorText}>{scanError}</Text>
            )}

            {!nfcStatus.isSupported && Platform.OS !== "web" && (
              <Text style={[styles.warningText, { color: "#FF9500" }]}>
                NFC is not available on this device
              </Text>
            )}

            {Platform.OS === "web" && (
              <Text style={[styles.warningText, { color: "#FF9500" }]}>
                NFC scanning requires the mobile app
              </Text>
            )}
          </View>
        </Card>
      </View>

      <View>
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}
          >
            Active Surveys
          </Text>

          {activeSurveys.length === 0 ? (
            <Card>
              <Text
                style={[styles.emptyText, { color: isDark ? "#8E8E93" : "#6E6E73" }]}
              >
                No active surveys yet. Create one to get started!
              </Text>
              <Button
                title="Create Survey"
                variant="secondary"
                onPress={() => router.push("/create")}
                style={{ marginTop: 12 }}
              />
            </Card>
          ) : (
            <View style={styles.surveyList}>
              {activeSurveys.slice(0, 3).map((survey) => (
                <Card key={survey._id} style={styles.surveyCard}>
                  <Text
                    style={[
                      styles.surveyTitle,
                      { color: isDark ? "#FFFFFF" : "#000000" },
                    ]}
                  >
                    {survey.title}
                  </Text>
                  <Text
                    style={[
                      styles.surveyQuestion,
                      { color: isDark ? "#8E8E93" : "#6E6E73" },
                    ]}
                    numberOfLines={2}
                  >
                    {survey.question}
                  </Text>
                  <View style={styles.surveyMeta}>
                    <Text
                      style={[
                        styles.surveyMetaText,
                        { color: isDark ? "#636366" : "#AEAEB2" },
                      ]}
                    >
                      {survey.followUpQuestions.length} follow-up questions
                    </Text>
                  </View>
                </Card>
              ))}

              {activeSurveys.length > 3 && (
                <Button
                  title={`View all ${activeSurveys.length} surveys`}
                  variant="secondary"
                  onPress={() => router.push("/results")}
                />
              )}
            </View>
          )}
        </View>
      </View>

      <View>
        <View style={styles.quickActions}>
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}
          >
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <Button
              title="Create Survey"
              onPress={() => router.push("/create")}
              style={{ flex: 1 }}
            />
            <Button
              title="Write Tag"
              variant="secondary"
              onPress={() => router.push("/write-tag")}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  heroCard: {
    alignItems: "center",
    padding: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  scanSection: {
    width: "100%",
    gap: 12,
  },
  scanningIndicator: {
    alignItems: "center",
    paddingVertical: 24,
  },
  scanningIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  scanningText: {
    fontSize: 18,
    fontWeight: "600",
  },
  scanningHint: {
    fontSize: 14,
    marginTop: 4,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    fontSize: 14,
  },
  warningText: {
    textAlign: "center",
    fontSize: 14,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
  },
  surveyList: {
    gap: 12,
  },
  surveyCard: {
    padding: 16,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  surveyQuestion: {
    fontSize: 14,
  },
  surveyMeta: {
    marginTop: 8,
    flexDirection: "row",
  },
  surveyMetaText: {
    fontSize: 12,
  },
  quickActions: {
    gap: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
});
