import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { useColorScheme } from "@/components/useColorScheme";

interface MultipleChoiceProps {
  question: string;
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MultipleChoice({
  question,
  options,
  value,
  onSelect,
}: MultipleChoiceProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: isDark ? "#FFFFFF" : "#000000" }]}>
        {question}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <OptionItem
            key={option}
            option={option}
            isSelected={value === option}
            onSelect={() => onSelect(option)}
            isDark={isDark}
            index={index}
          />
        ))}
      </View>
    </View>
  );
}

function OptionItem({
  option,
  isSelected,
  onSelect,
  isDark,
  index,
}: {
  option: string;
  isSelected: boolean;
  onSelect: () => void;
  isDark: boolean;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  return (
    <Animated.View entering={FadeIn.delay(index * 50)}>
      <AnimatedPressable
        style={[
          styles.option,
          {
            backgroundColor: isSelected
              ? "#007AFF"
              : isDark
                ? "#2C2C2E"
                : "#F2F2F7",
            borderColor: isSelected ? "#007AFF" : "transparent",
          },
          animatedStyle,
        ]}
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={[
            styles.radio,
            {
              borderColor: isSelected ? "#FFFFFF" : isDark ? "#48484A" : "#C7C7CC",
              backgroundColor: isSelected ? "#FFFFFF" : "transparent",
            },
          ]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text
          style={[
            styles.optionText,
            { color: isSelected ? "#FFFFFF" : isDark ? "#FFFFFF" : "#000000" },
          ]}
        >
          {option}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});
