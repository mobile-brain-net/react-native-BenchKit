import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface BigButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function BigButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  style,
  textStyle,
  disabled = false
}: BigButtonProps) {
  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.text,
        styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
        variant === 'secondary' && styles.textSecondary,
        disabled && styles.textDisabled,
        textStyle
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutal,
  },
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.border,
  },
  accent: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.border,
  },
  secondary: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  disabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 56,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 72,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
  },
  textMedium: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
  },
  textLarge: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
  },
  textSecondary: {
    color: COLORS.text,
  },
  textDisabled: {
    color: COLORS.textSecondary,
  },
});