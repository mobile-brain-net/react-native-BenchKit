import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Delete } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface KeypadProps {
  onNumberPress: (number: string) => void;
  onDeletePress: () => void;
  showDecimal?: boolean;
}

export function Keypad({ onNumberPress, onDeletePress, showDecimal = false }: KeypadProps) {
  const handlePress = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNumberPress(value);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDeletePress();
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [showDecimal ? '.' : '', '0', 'delete'],
  ];

  return (
    <View style={styles.container}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, keyIndex) => {
            if (key === '') return <View key={keyIndex} style={styles.key} />;
            if (key === 'delete') {
              return (
                <TouchableOpacity
                  key={keyIndex}
                  style={[styles.key, styles.deleteKey]}
                  onPress={handleDelete}
                >
                  <Delete size={24} color={COLORS.text} />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={keyIndex}
                style={styles.key}
                onPress={() => handlePress(key)}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  key: {
    width: 72,
    height: 72,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutal,
  },
  deleteKey: {
    backgroundColor: COLORS.error,
  },
  keyText: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text,
  },
});