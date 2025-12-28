import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface ReelStepperProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  precision?: number;
  size?: 'small' | 'medium' | 'large';
}

export function ReelStepper({
  value,
  onValueChange,
  min = 0,
  max = 999,
  step = 1,
  suffix = '',
  precision = 0,
  size = 'medium',
}: ReelStepperProps) {
  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    if (newValue !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onValueChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    if (newValue !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onValueChange(newValue);
    }
  };

  const formatValue = (val: number) => {
    return precision > 0 ? val.toFixed(precision) : val.toString();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          button: { width: 36, height: 36 },
          valueContainer: { minHeight: 36, paddingHorizontal: 8, minWidth: 60 },
          iconSize: 16,
          fontSize: TYPOGRAPHY.fontSize.base,
        };
      case 'large':
        return {
          button: { width: 64, height: 64 },
          valueContainer: { minHeight: 64, paddingHorizontal: 20 },
          iconSize: 28,
          fontSize: TYPOGRAPHY.fontSize['3xl'],
        };
      default: // medium
        return {
          button: { width: 56, height: 56 },
          valueContainer: { minHeight: 56, paddingHorizontal: 16 },
          iconSize: 24,
          fontSize: TYPOGRAPHY.fontSize['2xl'],
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          sizeStyles.button,
          value <= min && styles.buttonDisabled,
        ]}
        onPress={handleDecrement}
        disabled={value <= min}
      >
        <Minus
          size={sizeStyles.iconSize}
          color={value <= min ? COLORS.textSecondary : COLORS.text}
        />
      </TouchableOpacity>

      <View style={[styles.valueContainer, sizeStyles.valueContainer]}>
        <Text style={[styles.value, { fontSize: sizeStyles.fontSize }]}>
          {formatValue(value)}
          {suffix}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          sizeStyles.button,
          value >= max && styles.buttonDisabled,
        ]}
        onPress={handleIncrement}
        disabled={value >= max}
      >
        <Plus
          size={sizeStyles.iconSize}
          color={value >= max ? COLORS.textSecondary : COLORS.text}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    ...SHADOWS.brutal,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
});
