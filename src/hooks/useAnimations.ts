import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  SharedValue,
} from "react-native-reanimated";

/**
 * Animation hooks that use useAnimatedStyle instead of entering/exiting props.
 * This is required for compatibility with React Native's New Architecture (Fabric).
 *
 * The `entering` prop from react-native-reanimated has known issues with Fabric
 * that cause "addViewAt: failed to insert view" errors on Android.
 */

interface FadeInUpOptions {
  delay?: number;
  duration?: number;
  translateY?: number;
}

/**
 * Hook for fade-in-up animation on mount
 */
export function useFadeInUp(options: FadeInUpOptions = {}) {
  const { delay = 0, duration = 400, translateY = 20 } = options;

  const opacity = useSharedValue(0);
  const translateYValue = useSharedValue(translateY);

  useEffect(() => {
    if (delay > 0) {
      opacity.value = withDelay(delay, withTiming(1, { duration }));
      translateYValue.value = withDelay(delay, withTiming(0, { duration }));
    } else {
      opacity.value = withTiming(1, { duration });
      translateYValue.value = withTiming(0, { duration });
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateYValue.value }],
  }));

  return animatedStyle;
}

interface FadeInOptions {
  delay?: number;
  duration?: number;
}

/**
 * Hook for simple fade-in animation on mount
 */
export function useFadeIn(options: FadeInOptions = {}) {
  const { delay = 0, duration = 400 } = options;

  const opacity = useSharedValue(0);

  useEffect(() => {
    if (delay > 0) {
      opacity.value = withDelay(delay, withTiming(1, { duration }));
    } else {
      opacity.value = withTiming(1, { duration });
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
}

interface ConditionalFadeInUpOptions {
  condition: boolean;
  delay?: number;
  duration?: number;
  translateY?: number;
}

/**
 * Hook for conditional fade-in-up animation (animates when condition becomes true)
 */
export function useConditionalFadeInUp(options: ConditionalFadeInUpOptions) {
  const { condition, delay = 0, duration = 400, translateY = 20 } = options;

  const opacity = useSharedValue(0);
  const translateYValue = useSharedValue(translateY);

  useEffect(() => {
    if (condition) {
      if (delay > 0) {
        opacity.value = withDelay(delay, withTiming(1, { duration }));
        translateYValue.value = withDelay(delay, withTiming(0, { duration }));
      } else {
        opacity.value = withTiming(1, { duration });
        translateYValue.value = withTiming(0, { duration });
      }
    } else {
      opacity.value = 0;
      translateYValue.value = translateY;
    }
  }, [condition]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateYValue.value }],
  }));

  return animatedStyle;
}

interface SlideTransitionOptions {
  key: string | number;
  duration?: number;
  translateX?: number;
}

/**
 * Hook for slide transition animation (animates when key changes)
 */
export function useSlideTransition(options: SlideTransitionOptions) {
  const { key, duration = 300, translateX = 50 } = options;

  const opacity = useSharedValue(1);
  const translateXValue = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    translateXValue.value = translateX;
    opacity.value = withTiming(1, { duration });
    translateXValue.value = withTiming(0, { duration });
  }, [key]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateXValue.value }],
  }));

  return animatedStyle;
}

/**
 * Hook for creating multiple staggered fade-in-up animations
 * Note: This uses individual hooks at the top level to comply with Rules of Hooks.
 * The count parameter must be a constant (not dynamic) for proper hook behavior.
 */
export function useStaggeredFadeInUp(
  count: 3,
  options: { baseDelay?: number; staggerDelay?: number; duration?: number } = {}
) {
  const { baseDelay = 100, staggerDelay = 100, duration = 400 } = options;
  const translateY = 20;

  // Create shared values for each animation at the top level (not in loops)
  const opacity1 = useSharedValue(0);
  const translateY1 = useSharedValue(translateY);
  const opacity2 = useSharedValue(0);
  const translateY2 = useSharedValue(translateY);
  const opacity3 = useSharedValue(0);
  const translateY3 = useSharedValue(translateY);

  useEffect(() => {
    const delay1 = baseDelay;
    const delay2 = baseDelay + staggerDelay;
    const delay3 = baseDelay + staggerDelay * 2;

    opacity1.value = withDelay(delay1, withTiming(1, { duration }));
    translateY1.value = withDelay(delay1, withTiming(0, { duration }));

    opacity2.value = withDelay(delay2, withTiming(1, { duration }));
    translateY2.value = withDelay(delay2, withTiming(0, { duration }));

    opacity3.value = withDelay(delay3, withTiming(1, { duration }));
    translateY3.value = withDelay(delay3, withTiming(0, { duration }));
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    opacity: opacity1.value,
    transform: [{ translateY: translateY1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: opacity2.value,
    transform: [{ translateY: translateY2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    opacity: opacity3.value,
    transform: [{ translateY: translateY3.value }],
  }));

  return [animatedStyle1, animatedStyle2, animatedStyle3] as const;
}
