import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useMutation } from "convex/react";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { api } from "@/convex/_generated/api";
import { Button, Card } from "@/src/components/ui";
import { useColorScheme } from "@/components/useColorScheme";

type QuestionType = "multiple_choice" | "rating" | "text" | "yes_no";

interface FollowUpQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  min?: number;
  max?: number;
}

export default function CreateSurveyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSurvey = useMutation(api.surveys.create);

  const addFollowUpQuestion = (type: QuestionType) => {
    const newQuestion: FollowUpQuestion = {
      id: `q_${Date.now()}`,
      type,
      question: "",
      ...(type === "multiple_choice" ? { options: ["", ""] } : {}),
      ...(type === "rating" ? { min: 1, max: 5 } : {}),
    };
    setFollowUpQuestions([...followUpQuestions, newQuestion]);
  };

  const updateFollowUpQuestion = (id: string, updates: Partial<FollowUpQuestion>) => {
    setFollowUpQuestions((questions) =>
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeFollowUpQuestion = (id: string) => {
    setFollowUpQuestions((questions) => questions.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string) => {
    setFollowUpQuestions((questions) =>
      questions.map((q) =>
        q.id === questionId && q.options
          ? { ...q, options: [...q.options, ""] }
          : q
      )
    );
  };

  const updateOption = (questionId: string, index: number, value: string) => {
    setFollowUpQuestions((questions) =>
      questions.map((q) =>
        q.id === questionId && q.options
          ? {
              ...q,
              options: q.options.map((opt, i) => (i === index ? value : opt)),
            }
          : q
      )
    );
  };

  const removeOption = (questionId: string, index: number) => {
    setFollowUpQuestions((questions) =>
      questions.map((q) =>
        q.id === questionId && q.options && q.options.length > 2
          ? { ...q, options: q.options.filter((_, i) => i !== index) }
          : q
      )
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a survey title.");
      return;
    }

    if (!question.trim()) {
      Alert.alert("Missing Question", "Please enter the main survey question.");
      return;
    }

    const validFollowUps = followUpQuestions.filter((q) => {
      if (!q.question.trim()) return false;
      if (q.type === "multiple_choice" && q.options) {
        return q.options.filter((o) => o.trim()).length >= 2;
      }
      return true;
    });

    setIsSubmitting(true);

    try {
      const surveyId = await createSurvey({
        title: title.trim(),
        question: question.trim(),
        followUpQuestions: validFollowUps.map((q) => ({
          id: q.id,
          type: q.type,
          question: q.question.trim(),
          ...(q.options ? { options: q.options.filter((o) => o.trim()) } : {}),
          ...(q.min !== undefined ? { min: q.min } : {}),
          ...(q.max !== undefined ? { max: q.max } : {}),
        })),
      });

      Alert.alert(
        "Survey Created",
        "Your survey has been created successfully. Would you like to program NFC tags for it?",
        [
          {
            text: "Later",
            style: "cancel",
            onPress: () => router.replace("/"),
          },
          {
            text: "Write Tags",
            onPress: () => router.replace("/write-tag"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create survey"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionTypes: { type: QuestionType; label: string; icon: string }[] = [
    { type: "yes_no", label: "Yes/No", icon: "check-circle" },
    { type: "multiple_choice", label: "Multiple Choice", icon: "list" },
    { type: "rating", label: "Rating", icon: "star" },
    { type: "text", label: "Text", icon: "pencil" },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#000000" : "#F2F2F7" },
        ]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp}>
          <Card style={styles.card}>
            <Text style={[styles.label, { color: isDark ? "#FFFFFF" : "#000000" }]}>
              Survey Title
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
                  color: isDark ? "#FFFFFF" : "#000000",
                },
              ]}
              placeholder="e.g., Customer Feedback"
              placeholderTextColor={isDark ? "#636366" : "#8E8E93"}
              value={title}
              onChangeText={setTitle}
            />

            <Text
              style={[
                styles.label,
                { color: isDark ? "#FFFFFF" : "#000000", marginTop: 16 },
              ]}
            >
              Main Question (Yes/No)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
                  color: isDark ? "#FFFFFF" : "#000000",
                },
              ]}
              placeholder="e.g., Would you recommend us?"
              placeholderTextColor={isDark ? "#636366" : "#8E8E93"}
              value={question}
              onChangeText={setQuestion}
              multiline
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}
            >
              Follow-up Questions
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: isDark ? "#8E8E93" : "#6E6E73" }]}
            >
              Optional questions shown after voting
            </Text>
          </View>

          {followUpQuestions.map((fq, index) => (
            <Animated.View
              key={fq.id}
              entering={FadeInUp}
              exiting={FadeOutUp}
            >
              <Card style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text
                    style={[
                      styles.questionNumber,
                      { color: isDark ? "#8E8E93" : "#6E6E73" },
                    ]}
                  >
                    Question {index + 1} ({fq.type.replace("_", " ")})
                  </Text>
                  <Pressable
                    onPress={() => removeFollowUpQuestion(fq.id)}
                    hitSlop={8}
                  >
                    <FontAwesome
                      name="trash"
                      size={18}
                      color="#FF3B30"
                    />
                  </Pressable>
                </View>

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#1C1C1E" : "#E5E5EA",
                      color: isDark ? "#FFFFFF" : "#000000",
                    },
                  ]}
                  placeholder="Enter your question"
                  placeholderTextColor={isDark ? "#636366" : "#8E8E93"}
                  value={fq.question}
                  onChangeText={(text) =>
                    updateFollowUpQuestion(fq.id, { question: text })
                  }
                />

                {fq.type === "multiple_choice" && fq.options && (
                  <View style={styles.optionsContainer}>
                    {fq.options.map((option, optIndex) => (
                      <View key={optIndex} style={styles.optionRow}>
                        <TextInput
                          style={[
                            styles.input,
                            styles.optionInput,
                            {
                              backgroundColor: isDark ? "#1C1C1E" : "#E5E5EA",
                              color: isDark ? "#FFFFFF" : "#000000",
                            },
                          ]}
                          placeholder={`Option ${optIndex + 1}`}
                          placeholderTextColor={isDark ? "#636366" : "#8E8E93"}
                          value={option}
                          onChangeText={(text) =>
                            updateOption(fq.id, optIndex, text)
                          }
                        />
                        {fq.options!.length > 2 && (
                          <Pressable
                            onPress={() => removeOption(fq.id, optIndex)}
                            style={styles.removeOption}
                          >
                            <FontAwesome
                              name="minus-circle"
                              size={20}
                              color="#FF3B30"
                            />
                          </Pressable>
                        )}
                      </View>
                    ))}
                    <Pressable
                      onPress={() => addOption(fq.id)}
                      style={styles.addOptionButton}
                    >
                      <FontAwesome
                        name="plus"
                        size={14}
                        color="#007AFF"
                      />
                      <Text style={styles.addOptionText}>Add Option</Text>
                    </Pressable>
                  </View>
                )}

                {fq.type === "rating" && (
                  <View style={styles.ratingConfig}>
                    <View style={styles.ratingInputGroup}>
                      <Text
                        style={[
                          styles.ratingLabel,
                          { color: isDark ? "#8E8E93" : "#6E6E73" },
                        ]}
                      >
                        Min
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          styles.ratingInput,
                          {
                            backgroundColor: isDark ? "#1C1C1E" : "#E5E5EA",
                            color: isDark ? "#FFFFFF" : "#000000",
                          },
                        ]}
                        keyboardType="number-pad"
                        value={String(fq.min ?? 1)}
                        onChangeText={(text) =>
                          updateFollowUpQuestion(fq.id, {
                            min: parseInt(text) || 1,
                          })
                        }
                      />
                    </View>
                    <View style={styles.ratingInputGroup}>
                      <Text
                        style={[
                          styles.ratingLabel,
                          { color: isDark ? "#8E8E93" : "#6E6E73" },
                        ]}
                      >
                        Max
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          styles.ratingInput,
                          {
                            backgroundColor: isDark ? "#1C1C1E" : "#E5E5EA",
                            color: isDark ? "#FFFFFF" : "#000000",
                          },
                        ]}
                        keyboardType="number-pad"
                        value={String(fq.max ?? 5)}
                        onChangeText={(text) =>
                          updateFollowUpQuestion(fq.id, {
                            max: parseInt(text) || 5,
                          })
                        }
                      />
                    </View>
                  </View>
                )}
              </Card>
            </Animated.View>
          ))}

          <Card style={styles.addQuestionCard}>
            <Text
              style={[
                styles.addQuestionTitle,
                { color: isDark ? "#FFFFFF" : "#000000" },
              ]}
            >
              Add Follow-up Question
            </Text>
            <View style={styles.questionTypes}>
              {questionTypes.map((qt) => (
                <Pressable
                  key={qt.type}
                  style={[
                    styles.questionTypeButton,
                    { backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA" },
                  ]}
                  onPress={() => addFollowUpQuestion(qt.type)}
                >
                  <FontAwesome
                    name={qt.icon as any}
                    size={20}
                    color="#007AFF"
                  />
                  <Text
                    style={[
                      styles.questionTypeLabel,
                      { color: isDark ? "#FFFFFF" : "#000000" },
                    ]}
                  >
                    {qt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </Animated.View>

        <View style={styles.footer}>
          <Button
            title="Create Survey"
            onPress={handleSubmit}
            loading={isSubmitting}
            size="large"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  card: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  questionCard: {
    padding: 16,
    gap: 12,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  optionsContainer: {
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionInput: {
    flex: 1,
  },
  removeOption: {
    padding: 4,
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  addOptionText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  ratingConfig: {
    flexDirection: "row",
    gap: 16,
  },
  ratingInputGroup: {
    gap: 4,
  },
  ratingLabel: {
    fontSize: 12,
  },
  ratingInput: {
    width: 60,
    textAlign: "center",
  },
  addQuestionCard: {
    padding: 16,
    alignItems: "center",
  },
  addQuestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  questionTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  questionTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  questionTypeLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    paddingVertical: 16,
  },
});
