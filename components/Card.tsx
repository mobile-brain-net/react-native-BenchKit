import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'large';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[
      styles.card,
      variant === 'large' ? styles.cardLarge : styles.cardDefault,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cardDefault: {
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.brutal,
  },
  cardLarge: {
    borderRadius: 16,
    padding: 24,
    ...SHADOWS.brutalLarge,
  },
});