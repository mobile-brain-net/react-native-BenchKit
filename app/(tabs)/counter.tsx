import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Card } from '../../components/Card';
import { BigButton } from '../../components/BigButton';
import { ReelStepper } from '../../components/ReelStepper';
import { DataStore } from '../../lib/storage';
import { formatDuration } from '../../lib/formulas';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/theme';

export default function CounterScreen() {
  const [currentReps, setCurrentReps] = useState(0);
  const [targetReps, setTargetReps] = useState(12);
  const [currentSet, setCurrentSet] = useState(1);
  const [targetSets, setTargetSets] = useState(3);
  const [restTime, setRestTime] = useState(90); // seconds
  const [isResting, setIsResting] = useState(false);
  const [restRemaining, setRestRemaining] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  
  const restIntervalRef = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (restRemaining <= 0 && isResting) {
      setIsResting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [restRemaining, isResting]);

  const incrementReps = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCurrentReps(prev => prev + 1);
  };

  const completeSet = () => {
    if (currentReps === 0) {
      Alert.alert('No Reps', 'Add some reps before completing the set.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (currentSet >= targetSets) {
      // Session complete
      setSessionComplete(true);
      return;
    }

    // Start rest timer
    setIsResting(true);
    setRestRemaining(restTime);
    setCurrentSet(prev => prev + 1);
    setCurrentReps(0);
    
    restIntervalRef.current = setInterval(() => {
      setRestRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(restIntervalRef.current!);
        }
        return Math.max(0, newTime);
      });
    }, 1000);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestRemaining(0);
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
  };

  const resetSession = () => {
    setCurrentReps(0);
    setCurrentSet(1);
    setIsResting(false);
    setRestRemaining(0);
    setSessionComplete(false);
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
  };

  const savePreset = () => {
    if (Platform.OS === 'web') {
      const name = window.prompt('Enter a name for this rep counter configuration:');
      if (name) {
        const store = DataStore.getInstance();
        store.savePreset(name, 'repcounter', {
          targetReps,
          targetSets,
          restTime,
        }).then(() => {
          Alert.alert('Saved!', `Preset "${name}" has been saved.`);
        });
      }
    } else {
      Alert.prompt(
        'Save Preset',
        'Enter a name for this rep counter configuration:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (name) => {
              if (name) {
                const store = DataStore.getInstance();
                await store.savePreset(name, 'repcounter', {
                  targetReps,
                  targetSets,
                  restTime,
                });
                Alert.alert('Saved!', `Preset "${name}" has been saved.`);
              }
            },
          },
        ]
      );
    }
  };

  if (sessionComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rep Counter</Text>
        </View>
        
        <View style={styles.completedContainer}>
          <Card style={styles.completedCard} variant="large">
            <Text style={styles.completedTitle}>Session Complete!</Text>
            <Text style={styles.completedSummary}>
              {targetSets} sets × {targetReps} target reps
            </Text>
            <BigButton
              title="New Session"
              onPress={resetSession}
              variant="primary"
              size="large"
              style={styles.newSessionButton}
            />
          </Card>
        </View>
      </View>
    );
  }

  if (isResting) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rep Counter</Text>
        </View>
        
        <View style={styles.restContainer}>
          <Card style={styles.restCard} variant="large">
            <Text style={styles.restTitle}>Rest Time</Text>
            <Text style={styles.restTime}>
              {formatDuration(restRemaining)}
            </Text>
            <Text style={styles.restSet}>
              Set {currentSet} / {targetSets}
            </Text>
            
            <View style={styles.restButtons}>
              <BigButton
                title="Skip Rest"
                onPress={skipRest}
                variant="secondary"
                style={styles.flexButton}
              />
            </View>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Rep Counter</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.configSection}>
          <View style={styles.configRow}>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Target Reps</Text>
              <ReelStepper
                value={targetReps}
                onValueChange={setTargetReps}
                min={1}
                max={50}
              />
            </View>
            
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Sets</Text>
              <ReelStepper
                value={targetSets}
                onValueChange={setTargetSets}
                min={1}
                max={10}
              />
            </View>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Rest Time</Text>
            <ReelStepper
              value={restTime}
              onValueChange={setRestTime}
              min={30}
              max={300}
              step={15}
              suffix=" sec"
            />
          </View>
        </Card>

        <Card style={styles.counterSection} variant="large">
          <View style={styles.setInfo}>
            <Text style={styles.setNumber}>
              Set {currentSet} / {targetSets}
            </Text>
            <Text style={styles.repProgress}>
              {currentReps} / {targetReps}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.tapArea}
            onPress={incrementReps}
            activeOpacity={0.8}
          >
            <Text style={styles.tapText}>TAP</Text>
            <Text style={styles.repCount}>{currentReps}</Text>
            <Text style={styles.tapHint}>Tap to add rep</Text>
          </TouchableOpacity>

          <BigButton
            title="Complete Set"
            onPress={completeSet}
            variant="primary"
            size="large"
            style={styles.completeButton}
          />
        </Card>

        <View style={styles.actionButtons}>
          <BigButton
            title="Reset"
            onPress={resetSession}
            variant="secondary"
            style={styles.flexButton}
          />
          <BigButton
            title="Save Preset"
            onPress={savePreset}
            variant="accent"
            style={styles.flexButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.waveYellow,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING['3xl'],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  configSection: {
    marginBottom: SPACING.xl,
  },
  configRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  configItem: {
    flex: 1,
  },
  configLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  counterSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  setInfo: {
    alignItems: 'center',
    width: '100%',
  },
  setNumber: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  repProgress: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tapArea: {
    width: 280,
    height: 280,
    backgroundColor: COLORS.primary,
    borderRadius: 140,
    borderWidth: 4,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutalLarge,
  },
  tapText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  repCount: {
    fontSize: TYPOGRAPHY.fontSize['6xl'],
    color: COLORS.text,
    fontWeight: 'bold',
  },
  tapHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginTop: SPACING.sm,
    opacity: 0.8,
  },
  completeButton: {
    width: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  flexButton: {
    flex: 1,
  },
  restContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  restCard: {
    alignItems: 'center',
    width: '100%',
  },
  restTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  restTime: {
    fontSize: TYPOGRAPHY.fontSize['6xl'],
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: SPACING.sm,
  },
  restSet: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  restButtons: {
    flexDirection: 'row',
    gap: SPACING.lg,
    width: '100%',
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  completedCard: {
    alignItems: 'center',
    width: '100%',
  },
  completedTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SPACING.lg,
  },
  completedSummary: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  newSessionButton: {
    width: '100%',
  },
});