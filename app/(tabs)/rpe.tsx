import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Card } from '../../components/Card';
import { BigButton } from '../../components/BigButton';
import { ReelStepper } from '../../components/ReelStepper';
import { DataStore } from '../../lib/storage';
import { Units } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export default function RPEScreen() {
  const [oneRM, setOneRM] = useState(100);
  const [targetRPE, setTargetRPE] = useState(8);
  const [units, setUnits] = useState<Units['weight']>('kg');
  const [rpeMap, setRPEMap] = useState<Record<number, number>>({});
  const [suggestedWeight, setSuggestedWeight] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateSuggestedWeight();
  }, [oneRM, targetRPE, rpeMap]);

  const loadData = async () => {
    const store = DataStore.getInstance();
    await store.initialize();
    const data = store.getStore();
    setUnits(data.units.weight);
    setRPEMap(data.rpeMap);
  };

  const calculateSuggestedWeight = () => {
    const percentage = rpeMap[targetRPE] || 0;
    const weight = (oneRM * percentage) / 100;
    setSuggestedWeight(weight);
  };

  const savePreset = () => {
    if (Platform.OS === 'web') {
      const name = window.prompt('Enter a name for this RPE configuration:');
      if (name) {
        const store = DataStore.getInstance();
        store.savePreset(name, 'rpe', {
          oneRM,
          targetRPE,
          units,
        }).then(() => {
          Alert.alert('Saved!', `Preset "${name}" has been saved.`);
        });
      }
    } else {
      Alert.prompt(
        'Save Preset',
        'Enter a name for this RPE configuration:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (name) => {
              if (name) {
                const store = DataStore.getInstance();
                await store.savePreset(name, 'rpe', {
                  oneRM,
                  targetRPE,
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

  const renderRPERow = (rpe: number, percentage: number) => (
    <View key={rpe} style={styles.rpeRow}>
      <Text style={styles.rpeValue}>RPE {rpe}</Text>
      <Text style={styles.rpePercentage}>{percentage}%</Text>
      <Text style={styles.rpeWeight}>
        {((oneRM * percentage) / 100).toFixed(1)}{units}
      </Text>
    </View>
  );

  const getRIRText = (rpe: number) => {
    const rir = 10 - rpe;
    if (rir === 0) return 'Max effort';
    if (rir === 0.5) return '0-1 reps left';
    return `${rir} reps left`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RPE Converter</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Current 1RM</Text>
          <ReelStepper
            value={oneRM}
            onValueChange={setOneRM}
            min={10}
            max={500}
            step={units === 'kg' ? 2.5 : 5}
            suffix={` ${units}`}
            precision={1}
          />
        </Card>

        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Target RPE</Text>
          <ReelStepper
            value={targetRPE}
            onValueChange={setTargetRPE}
            min={6}
            max={10}
            step={0.5}
            precision={1}
          />
          <Text style={styles.rirText}>
            {getRIRText(targetRPE)}
          </Text>
        </Card>

        <Card style={styles.resultCard}>
          <Text style={styles.cardTitle}>Suggested Weight</Text>
          <View style={styles.suggestedContainer}>
            <Text style={styles.suggestedValue}>
              {suggestedWeight.toFixed(1)}
            </Text>
            <Text style={styles.suggestedUnits}>{units}</Text>
          </View>
          <Text style={styles.suggestedPercentage}>
            {rpeMap[targetRPE] || 0}% of 1RM
          </Text>
        </Card>

        <Card style={styles.tableCard}>
          <Text style={styles.cardTitle}>RPE Chart</Text>
          <View style={styles.rpeTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>RPE</Text>
              <Text style={styles.tableHeaderText}>%1RM</Text>
              <Text style={styles.tableHeaderText}>Weight</Text>
            </View>
            {Object.entries(rpeMap)
              .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
              .map(([rpe, percentage]) => 
                renderRPERow(parseFloat(rpe), percentage)
              )}
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
  tableCard: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  rirText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  suggestedContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  suggestedValue: {
    fontSize: TYPOGRAPHY.fontSize['6xl'],
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  suggestedUnits: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  suggestedPercentage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  rpeTable: {
    gap: SPACING.xs,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  tableHeaderText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  rpeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rpeValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  rpePercentage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  rpeWeight: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  buttonRow: {
    marginTop: SPACING.lg,
  },
  flexButton: {
    flex: 1,
  },
});