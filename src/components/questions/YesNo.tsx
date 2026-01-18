import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useColorScheme } from "@/components/useColorScheme";

interface YesNoProps {
  question: string;
  value: "yes" | "no" | null;
  onSelect: (value: "yes" | "no") => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function YesNo({ question, value, onSelect }: YesNoProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const yesScale = useSharedValue(1);
  const noScale = useSharedValue(1);

  const yesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: yesScale.value }],
  }));

  const noAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: noScale.value }],
  }));

  const handlePress = (selected: "yes" | "no") => {
    const scale = selected === "yes" ? yesScale : noScale;
    scale.value = withSpring(0.9, { damping: 10 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10 });
    }, 100);
    onSelect(selected);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: isDark ? "#FFFFFF" : "#000000" }]}>
        {question}
      </Text>
      <View style={styles.buttonContainer}>
        <AnimatedPressable
          style={[
            styles.button,
            {
              backgroundColor: value === "yes" ? "#34C759" : isDark ? "#2C2C2E" : "#E5E5EA",
            },
            yesAnimatedStyle,
          ]}
          onPress={() => handlePress("yes")}
        >
          <Text
            style={[
              styles.buttonText,
              { color: value === "yes" ? "#FFFFFF" : isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            Yes
          </Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={[
            styles.button,
            {
              backgroundColor: value === "no" ? "#FF3B30" : isDark ? "#2C2C2E" : "#E5E5EA",
            },
            noAnimatedStyle,
          ]}
          onPress={() => handlePress("no")}
        >
          <Text
            style={[
              styles.buttonText,
              { color: value === "no" ? "#FFFFFF" : isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            No
          </Text>
        </AnimatedPressable>
      </View>
    </View>
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
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
