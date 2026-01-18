import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useQuery } from "convex/react";
import Animated, { FadeInUp } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useNfc } from "@/src/hooks/useNfc";
import { Button, Card } from "@/src/components/ui";
import { useColorScheme } from "@/components/useColorScheme";

type ResponseType = "yes" | "no";

export default function WriteTagScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { status: nfcStatus, writeTag } = useNfc();

  const [selectedSurveyId, setSelectedSurveyId] = useState<Id<"surveys"> | null>(
    null
  );
  const [selectedResponse, setSelectedResponse] = useState<ResponseType | null>(
    null
  );
  const [isWriting, setIsWriting] = useState(false);
  const [writeSuccess, setWriteSuccess] = useState(false);

  const surveys = useQuery(api.surveys.list);
  const activeSurveys = surveys?.filter((s) => s.isActive) ?? [];
  const selectedSurvey = activeSurveys.find((s) => s._id === selectedSurveyId);

  const handleWriteTag = async () => {
    if (!selectedSurveyId || !selectedResponse) {
      Alert.alert("Selection Required", "Please select a survey and response type.");
      return;
    }

    if (!nfcStatus.isSupported) {
      Alert.alert(
        "NFC Not Supported",
        "This device does not support NFC writing."
      );
      return;
    }

    if (!nfcStatus.isEnabled) {
      Alert.alert(
        "NFC Disabled",
        "Please enable NFC in your device settings."
      );
      return;
    }

    setIsWriting(true);
    setWriteSuccess(false);

    try {
      const success = await writeTag(selectedSurveyId, selectedResponse);

      if (success) {
        setWriteSuccess(true);
        Alert.alert(
          "Tag Written",
          `Successfully wrote ${selectedResponse.toUpperCase()} vote to the NFC tag.`,
          [
            {
              text: "Write Another",
              onPress: () => setWriteSuccess(false),
            },
            {
              text: "Done",
              style: "cancel",
            },
          ]
        );
      } else {
        Alert.alert("Write Failed", "Could not write to the NFC tag. Try again.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to write to tag"
      );
    } finally {
      setIsWriting(false);
    }
  };

  const generatedUrl = selectedSurveyId && selectedResponse
    ? `nfcsurvey://survey/${selectedSurveyId}/${selectedResponse}`
    : null;

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#F2F2F7" },
      ]}
      contentContainerStyle={styles.content}
    >
      {Platform.OS === "web" ? (
        <Card style={styles.warningCard}>
          <FontAwesome name="exclamation-triangle" size={32} color="#FF9500" />
          <Text style={[styles.warningTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>
            NFC Not Available
          </Text>
          <Text style={[styles.warningText, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
            NFC tag writing requires the mobile app on a device with NFC support.
          </Text>
        </Card>
      ) : (
        <>
          <Animated.View entering={FadeInUp}>
            <Card>
              <Text style={[styles.stepTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>
                Step 1: Select Survey
              </Text>
              <Text
                style={[styles.stepDescription, { color: isDark ? "#8E8E93" : "#6E6E73" }]}
              >
                Choose which survey this tag will be linked to
              </Text>

              {activeSurveys.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text
                    style={[styles.emptyText, { color: isDark ? "#8E8E93" : "#6E6E73" }]}
                  >
                    No active surveys. Create one first.
                  </Text>
                </View>
              ) : (
                <View style={styles.surveyList}>
                  {activeSurveys.map((survey) => (
                    <Pressable
                      key={survey._id}
                      style={[
                        styles.surveyOption,
                        {
                          backgroundColor:
                            selectedSurveyId === survey._id
                              ? "#007AFF"
                              : isDark
                                ? "#2C2C2E"
                                : "#E5E5EA",
                        },
                      ]}
                      onPress={() => setSelectedSurveyId(survey._id)}
                    >
                      <View style={styles.radioOuter}>
                        {selectedSurveyId === survey._id && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <View style={styles.surveyInfo}>
                        <Text
                          style={[
                            styles.surveyTitle,
                            {
                              color:
                                selectedSurveyId === survey._id
                                  ? "#FFFFFF"
                                  : isDark
                                    ? "#FFFFFF"
                                    : "#000000",
                            },
                          ]}
                        >
                          {survey.title}
                        </Text>
                        <Text
                          style={[
                            styles.surveyQuestion,
                            {
                              color:
                                selectedSurveyId === survey._id
                                  ? "rgba(255,255,255,0.8)"
                                  : isDark
                                    ? "#8E8E93"
                                    : "#6E6E73",
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {survey.question}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(100)}>
            <Card>
              <Text style={[styles.stepTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>
                Step 2: Select Response
              </Text>
              <Text
                style={[styles.stepDescription, { color: isDark ? "#8E8E93" : "#6E6E73" }]}
              >
                Choose the vote this tag will register when tapped
              </Text>

              <View style={styles.responseOptions}>
                <Pressable
                  style={[
                    styles.responseOption,
                    {
                      backgroundColor:
                        selectedResponse === "yes"
                          ? "#34C759"
                          : isDark
                            ? "#2C2C2E"
                            : "#E5E5EA",
                    },
                  ]}
                  onPress={() => setSelectedResponse("yes")}
                >
                  <FontAwesome
                    name="thumbs-up"
                    size={32}
                    color={selectedResponse === "yes" ? "#FFFFFF" : "#34C759"}
                  />
                  <Text
                    style={[
                      styles.responseLabel,
                      {
                        color:
                          selectedResponse === "yes"
                            ? "#FFFFFF"
                            : isDark
                              ? "#FFFFFF"
                              : "#000000",
                      },
                    ]}
                  >
                    Yes
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.responseOption,
                    {
                      backgroundColor:
                        selectedResponse === "no"
                          ? "#FF3B30"
                          : isDark
                            ? "#2C2C2E"
                            : "#E5E5EA",
                    },
                  ]}
                  onPress={() => setSelectedResponse("no")}
                >
                  <FontAwesome
                    name="thumbs-down"
                    size={32}
                    color={selectedResponse === "no" ? "#FFFFFF" : "#FF3B30"}
                  />
                  <Text
                    style={[
                      styles.responseLabel,
                      {
                        color:
                          selectedResponse === "no"
                            ? "#FFFFFF"
                            : isDark
                              ? "#FFFFFF"
                              : "#000000",
                      },
                    ]}
                  >
                    No
                  </Text>
                </Pressable>
              </View>
            </Card>
          </Animated.View>

          {selectedSurvey && selectedResponse && (
            <Animated.View entering={FadeInUp.delay(200)}>
              <Card>
                <Text
                  style={[styles.stepTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}
                >
                  Step 3: Write to Tag
                </Text>
                <Text
                  style={[
                    styles.stepDescription,
                    { color: isDark ? "#8E8E93" : "#6E6E73" },
                  ]}
                >
                  Hold an NFC tag near your device to program it
                </Text>

                <View style={styles.summary}>
                  <View style={styles.summaryRow}>
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: isDark ? "#8E8E93" : "#6E6E73" },
                      ]}
                    >
                      Survey:
                    </Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        { color: isDark ? "#FFFFFF" : "#000000" },
                      ]}
                    >
                      {selectedSurvey.title}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: isDark ? "#8E8E93" : "#6E6E73" },
                      ]}
                    >
                      Response:
                    </Text>
                    <View
                      style={[
                        styles.responseBadge,
                        {
                          backgroundColor:
                            selectedResponse === "yes" ? "#34C759" : "#FF3B30",
                        },
                      ]}
                    >
                      <Text style={styles.responseBadgeText}>
                        {selectedResponse.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {generatedUrl && (
                    <View style={styles.urlContainer}>
                      <Text
                        style={[
                          styles.summaryLabel,
                          { color: isDark ? "#8E8E93" : "#6E6E73" },
                        ]}
                      >
                        URL:
                      </Text>
                      <Text
                        style={[
                          styles.urlText,
                          { color: isDark ? "#636366" : "#AEAEB2" },
                        ]}
                        numberOfLines={2}
                      >
                        {generatedUrl}
                      </Text>
                    </View>
                  )}
                </View>

                <Button
                  title={isWriting ? "Hold tag near device..." : "Write to NFC Tag"}
                  onPress={handleWriteTag}
                  loading={isWriting}
                  variant={writeSuccess ? "success" : "primary"}
                  size="large"
                  disabled={!nfcStatus.isSupported || !nfcStatus.isEnabled}
                />

                {!nfcStatus.isSupported && (
                  <Text style={[styles.nfcWarning, { color: "#FF9500" }]}>
                    NFC is not available on this device
                  </Text>
                )}

                {nfcStatus.isSupported && !nfcStatus.isEnabled && (
                  <Text style={[styles.nfcWarning, { color: "#FF9500" }]}>
                    Please enable NFC in device settings
                  </Text>
                )}
              </Card>
            </Animated.View>
          )}
        </>
      )}
    </ScrollView>
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
  warningCard: {
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  warningText: {
    fontSize: 14,
    textAlign: "center",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  surveyList: {
    gap: 8,
  },
  surveyOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  surveyInfo: {
    flex: 1,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  surveyQuestion: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  responseOptions: {
    flexDirection: "row",
    gap: 12,
  },
  responseOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 24,
    borderRadius: 16,
    gap: 8,
  },
  responseLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  summary: {
    marginBottom: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  responseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  responseBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  urlContainer: {
    marginTop: 8,
  },
  urlText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginTop: 4,
  },
  nfcWarning: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 12,
  },
});
