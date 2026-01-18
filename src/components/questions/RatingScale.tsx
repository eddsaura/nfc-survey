import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useColorScheme } from "@/components/useColorScheme";

interface RatingScaleProps {
  question: string;
  min?: number;
  max?: number;
  value: number | null;
  onRate: (value: number) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function RatingScale({
  question,
  min = 1,
  max = 5,
  value,
  onRate,
}: RatingScaleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: isDark ? "#FFFFFF" : "#000000" }]}>
        {question}
      </Text>
      <View style={styles.ratingContainer}>
        {ratings.map((rating) => (
          <RatingButton
            key={rating}
            rating={rating}
            isSelected={value === rating}
            onSelect={() => onRate(rating)}
            isDark={isDark}
          />
        ))}
      </View>
      <View style={styles.labels}>
        <Text style={[styles.label, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
          {min}
        </Text>
        <Text style={[styles.label, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
          {max}
        </Text>
      </View>
    </View>
  );
}

function RatingButton({
  rating,
  isSelected,
  onSelect,
  isDark,
}: {
  rating: number;
  isSelected: boolean;
  onSelect: () => void;
  isDark: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.8, { damping: 10 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10 });
    }, 100);
    onSelect();
  };

  return (
    <AnimatedPressable
      style={[
        styles.ratingButton,
        {
          backgroundColor: isSelected
            ? "#FFD60A"
            : isDark
              ? "#2C2C2E"
              : "#F2F2F7",
        },
        animatedStyle,
      ]}
      onPress={handlePress}
    >
      <Text
        style={[
          styles.ratingText,
          { color: isSelected ? "#000000" : isDark ? "#FFFFFF" : "#000000" },
        ]}
      >
        {rating}
      </Text>
    </AnimatedPressable>
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
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "600",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
  },
});
