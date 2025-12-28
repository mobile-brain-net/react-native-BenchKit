import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Card } from '../../components/Card';
import { BigButton } from '../../components/BigButton';
import { ReelStepper } from '../../components/ReelStepper';
import { Keypad } from '../../components/Keypad';
import { DataStore } from '../../lib/storage';
import { calculatePace, calculateTime, calculateDistance, formatDuration, convertDistance } from '../../lib/formulas';
import { Units } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

type CalculationMode = 'pace' | 'time' | 'distance';

export default function PaceScreen() {
  const [mode, setMode] = useState<CalculationMode>('pace');
  const [distance, setDistance] = useState(5);
  const [timeMinutes, setTimeMinutes] = useState(25);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [paceMinutes, setPaceMinutes] = useState(5);
  const [paceSeconds, setPaceSeconds] = useState(0);
  const [units, setUnits] = useState<Units['distance']>('km');
  const [result, setResult] = useState('');

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    calculateResult();
  }, [mode, distance, timeMinutes, timeSeconds, paceMinutes, paceSeconds, units]);

  const loadUnits = async () => {
    const store = DataStore.getInstance();
    await store.initialize();
    const storeUnits = store.getStore().units;
    setUnits(storeUnits.distance);
  };

  const calculateResult = () => {
    try {
      switch (mode) {
        case 'pace':
          const totalTimeSeconds = timeMinutes * 60 + timeSeconds;
          const pace = calculatePace(distance, totalTimeSeconds, units);
          setResult(pace);
          break;
          
        case 'time':
          const timeInSeconds = calculateTime(distance, paceMinutes, paceSeconds);
          setResult(formatDuration(timeInSeconds));
          break;
          
        case 'distance':
          const totalTime = timeMinutes * 60 + timeSeconds;
          const calculatedDistance = calculateDistance(totalTime, paceMinutes, paceSeconds);
          setResult(`${calculatedDistance.toFixed(2)} ${units}`);
          break;
      }
    } catch (error) {
      setResult('Invalid inputs');
    }
  };

  const savePreset = () => {
    if (Platform.OS === 'web') {
      const name = window.prompt('Enter a name for this pace configuration:');
      if (name) {
        const store = DataStore.getInstance();
        store.savePreset(name, 'pacesplit', {
          mode,
          distance,
          timeMinutes,
          timeSeconds,
          paceMinutes,
          paceSeconds,
          units,
        }).then(() => {
          Alert.alert('Saved!', `Preset "${name}" has been saved.`);
        });
      }
    } else {
      Alert.prompt(
        'Save Preset',
        'Enter a name for this pace configuration:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (name) => {
              if (name) {
                const store = DataStore.getInstance();
                await store.savePreset(name, 'pacesplit', {
                  mode,
                  distance,
                  timeMinutes,
                  timeSeconds,
                  paceMinutes,
                  paceSeconds,
                  units,
                });
                Alert.alert('Saved!', `Preset "${name}" has been saved.`);
              }
            },
          },
        ]
      );
    }
  };

  const toggleUnits = () => {
    const newUnits = units === 'km' ? 'mi' : 'km';
    setUnits(newUnits);
    
    // Convert distance when units change
    setDistance(prev => convertDistance(prev, units, newUnits));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pace Calculator</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Calculate</Text>
          <View style={styles.modeButtons}>
            {(['pace', 'time', 'distance'] as CalculationMode[]).map((calcMode) => (
              <BigButton
                key={calcMode}
                title={calcMode.charAt(0).toUpperCase() + calcMode.slice(1)}
                onPress={() => setMode(calcMode)}
                variant={mode === calcMode ? 'primary' : 'secondary'}
                size="small"
                style={styles.modeButton}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Units</Text>
          <View style={styles.unitButtons}>
            <BigButton
              title="Kilometers"
              onPress={toggleUnits}
              variant={units === 'km' ? 'primary' : 'secondary'}
              size="small"
              style={styles.unitButton}
            />
            <BigButton
              title="Miles"
              onPress={toggleUnits}
              variant={units === 'mi' ? 'primary' : 'secondary'}
              size="small"
              style={styles.unitButton}
            />
          </View>
        </Card>

        {mode !== 'distance' && (
          <Card style={styles.configCard}>
            <Text style={styles.cardTitle}>Distance</Text>
            <ReelStepper
              value={distance}
              onValueChange={setDistance}
              min={0.1}
              max={100}
              step={0.1}
              suffix={` ${units}`}
              precision={1}
            />
          </Card>
        )}

        {mode !== 'time' && (
          <Card style={styles.configCard}>
            <Text style={styles.cardTitle}>Time</Text>
            <View style={styles.timeInputs}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Minutes</Text>
                <ReelStepper
                  value={timeMinutes}
                  onValueChange={setTimeMinutes}
                  min={0}
                  max={300}
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Seconds</Text>
                <ReelStepper
                  value={timeSeconds}
                  onValueChange={setTimeSeconds}
                  min={0}
                  max={59}
                />
              </View>
            </View>
          </Card>
        )}

        {mode !== 'pace' && (
          <Card style={styles.configCard}>
            <Text style={styles.cardTitle}>Pace</Text>
            <View style={styles.timeInputs}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Min/{units}</Text>
                <ReelStepper
                  value={paceMinutes}
                  onValueChange={setPaceMinutes}
                  min={3}
                  max={20}
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Seconds</Text>
                <ReelStepper
                  value={paceSeconds}
                  onValueChange={setPaceSeconds}
                  min={0}
                  max={59}
                />
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.resultCard}>
          <Text style={styles.cardTitle}>
            {mode === 'pace' ? 'Pace' : 
             mode === 'time' ? 'Total Time' : 'Distance'}
          </Text>
          <View style={styles.resultContainer}>
            <Text style={styles.resultValue}>
              {result || 'N/A'}
            </Text>
          </View>
        </Card>

        <View style={styles.buttonRow}>
          <BigButton
            title="Save Preset"
            onPress={savePreset}
            variant="secondary"
            style={styles.flexButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.waveYellow,
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
  scrollView: {
    flex: 1,
    padding: SPACING.lg,
  },
  configCard: {
    marginBottom: SPACING.lg,
  },
  resultCard: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modeButton: {
    flex: 1,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  unitButton: {
    flex: 1,
  },
  timeInputs: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  resultValue: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  buttonRow: {
    marginTop: SPACING.lg,
  },
  flexButton: {
    flex: 1,
  },
});