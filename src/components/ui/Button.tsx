import {
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  ViewStyle,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "success" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const variantColors = {
  primary: { bg: "#007AFF", text: "#FFFFFF" },
  secondary: { bg: "#E5E5EA", text: "#000000" },
  success: { bg: "#34C759", text: "#FFFFFF" },
  danger: { bg: "#FF3B30", text: "#FFFFFF" },
};

const sizeStyles = {
  small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
  medium: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 },
  large: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const colors = variantColors[variant];
  const sizes = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.bg,
          paddingVertical: sizes.paddingVertical,
          paddingHorizontal: sizes.paddingHorizontal,
          opacity: disabled || loading ? 0.5 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.text, { color: colors.text, fontSize: sizes.fontSize }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
});
