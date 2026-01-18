import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useDeviceId } from "@/src/hooks/useDeviceId";
import { useSurveyStore } from "@/src/store/surveyStore";
import { Button } from "@/src/components/ui";
import {
  YesNo,
  MultipleChoice,
  RatingScale,
  TextInputQuestion,
} from "@/src/components/questions";
import { useColorScheme } from "@/components/useColorScheme";

type AnswerValue = string | number | string[];

export default function FollowUpScreen() {
  const { surveyId } = useLocalSearchParams<{ surveyId: string }>();
  const { deviceId } = useDeviceId();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const currentVote = useSurveyStore((s) => s.currentVote);
  const clearCurrentVote = useSurveyStore((s) => s.clearCurrentVote);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const survey = useQuery(
    api.surveys.get,
    surveyId ? { id: surveyId as Id<"surveys"> } : "skip"
  );

  const submitFollowUp = useMutation(api.followUp.submit);

  const questions = survey?.followUpQuestions ?? [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const handleAnswer = (value: AnswerValue) => {
    if (currentQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: value,
      }));
    }
  };

  const handleNext = async () => {
    if (!currentAnswer) return;

    if (isLastQuestion) {
      await handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!surveyId || !deviceId || !currentVote.voteId) return;

    setIsSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      await submitFollowUp({
        surveyId: surveyId as Id<"surveys">,
        voteId: currentVote.voteId,
        answers: formattedAnswers,
        deviceId,
      });

      clearCurrentVote();
      router.replace({
        pathname: "/survey/[surveyId]/[response]",
        params: {
          surveyId,
          response: "complete",
        },
      });
    } catch (error) {
      console.error("Failed to submit follow-up:", error);
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    clearCurrentVote();
    router.replace("/");
  };

  if (!survey || questions.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#000000" : "#F2F2F7" },
        ]}
      >
        <Text style={[styles.loadingText, { color: isDark ? "#FFFFFF" : "#000000" }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#000000" : "#F2F2F7" },
        ]}
      >
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA" },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.progressText, { color: isDark ? "#8E8E93" : "#6E6E73" }]}
          >
            {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            key={currentQuestion.id}
            entering={FadeInRight}
            exiting={FadeOutLeft}
            style={styles.questionContainer}
          >
            {currentQuestion.type === "yes_no" && (
              <YesNo
                question={currentQuestion.question}
                value={currentAnswer as "yes" | "no" | null}
                onSelect={(value) => handleAnswer(value)}
              />
            )}

            {currentQuestion.type === "multiple_choice" && (
              <MultipleChoice
                question={currentQuestion.question}
                options={currentQuestion.options ?? []}
                value={currentAnswer as string | null}
                onSelect={(value) => handleAnswer(value)}
              />
            )}

            {currentQuestion.type === "rating" && (
              <RatingScale
                question={currentQuestion.question}
                min={currentQuestion.min ?? 1}
                max={currentQuestion.max ?? 5}
                value={currentAnswer as number | null}
                onRate={(value) => handleAnswer(value)}
              />
            )}

            {currentQuestion.type === "text" && (
              <TextInputQuestion
                question={currentQuestion.question}
                value={(currentAnswer as string) ?? ""}
                onChangeText={(value) => handleAnswer(value)}
                multiline
              />
            )}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Skip"
            variant="secondary"
            onPress={handleSkip}
            style={styles.skipButton}
          />
          <Button
            title={isLastQuestion ? "Submit" : "Next"}
            onPress={handleNext}
            disabled={!currentAnswer}
            loading={isSubmitting}
            style={styles.nextButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
  progressContainer: {
    padding: 16,
    gap: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  questionContainer: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
