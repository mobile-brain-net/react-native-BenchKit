import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card } from '../../components/Card';
import { BigButton } from '../../components/BigButton';
import { ReelStepper } from '../../components/ReelStepper';
import { DataStore } from '../../lib/storage';
import { Units } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export default function SettingsScreen() {
  const [units, setUnits] = useState<Units>({ weight: 'kg', distance: 'km' });
  const [rpeMap, setRPEMap] = useState<Record<number, number>>({});
  const [presetCount, setPresetCount] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const store = DataStore.getInstance();
    await store.initialize();
    const data = store.getStore();
    setUnits(data.units);
    setRPEMap(data.rpeMap);
    setPresetCount(data.presets.length);
  };

  const updateWeightUnit = async (weight: Units['weight']) => {
    const newUnits = { ...units, weight };
    setUnits(newUnits);
    const store = DataStore.getInstance();
    await store.setUnits({ weight });
  };

  const updateDistanceUnit = async (distance: Units['distance']) => {
    const newUnits = { ...units, distance };
    setUnits(newUnits);
    const store = DataStore.getInstance();
    await store.setUnits({ distance });
  };

  const updateRPEValue = async (rpe: number, percentage: number) => {
    const newRPEMap = { ...rpeMap, [rpe]: percentage };
    setRPEMap(newRPEMap);
    const store = DataStore.getInstance();
    await store.setRPEMap(newRPEMap);
  };

  const resetRPEMap = async () => {
    Alert.alert(
      'Reset RPE Map',
      'This will reset all RPE values to defaults. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const defaultRPEMap = {
              10: 100,
              9.5: 98,
              9: 96,
              8.5: 94,
              8: 92,
              7.5: 89,
              7: 86,
              6.5: 83,
              6: 80,
            };
            setRPEMap(defaultRPEMap);
            const store = DataStore.getInstance();
            await store.setRPEMap(defaultRPEMap);
            Alert.alert('Reset Complete', 'RPE values restored to defaults.');
          },
        },
      ]
    );
  };

  const clearAllPresets = async () => {
    Alert.alert(
      'Clear All Presets',
      `This will delete all ${presetCount} saved presets. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            const store = DataStore.getInstance();
            const presets = store.getPresets();
            for (const preset of presets) {
              await store.deletePreset(preset.id);
            }
            setPresetCount(0);
            Alert.alert('Cleared', 'All presets have been deleted.');
          },
        },
      ]
    );
  };

  const renderRPESetting = (rpe: number, percentage: number) => (
    <View key={rpe} style={styles.rpeRow}>
      <Text style={styles.rpeLabel}>RPE {rpe}</Text>
      <View style={styles.compactStepper}>
        <ReelStepper
          value={percentage}
          onValueChange={(value) => updateRPEValue(rpe, value)}
          min={50}
          max={100}
          step={1}
          suffix="%"
          size="small"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.settingCard}>
          <Text style={styles.cardTitle}>Weight Units</Text>
          <View style={styles.unitButtons}>
            <BigButton
              title="Kilograms"
              onPress={() => updateWeightUnit('kg')}
              variant={units.weight === 'kg' ? 'primary' : 'secondary'}
              size="small"
              style={styles.unitButton}
            />
            <BigButton
              title="Pounds"
              onPress={() => updateWeightUnit('lb')}
              variant={units.weight === 'lb' ? 'primary' : 'secondary'}
              size="small"
              style={styles.unitButton}
            />
          </View>
        </Card>

        <Card style={styles.settingCard}>
          <Text style={styles.cardTitle}>Distance Units</Text>
          <View style={styles.unitButtons}>
            <BigButton
              title="Kilometers"
              onPress={() => updateDistanceUnit('km')}
              variant={units.distance === 'km' ? 'primary' : 'secondary'}
              size="small"
              style={styles.unitButton}
            />
            <BigButton
              title="Miles"
              onPress={() => updateDistanceUnit('mi')}
              variant={units.distance === 'mi' ? 'primary' : 'secondary'}
              size="small"
              style={styles.unitButton}
            />
          </View>
        </Card>

        <Card style={styles.settingCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>RPE Mapping</Text>
            <BigButton
              title="Reset"
              onPress={resetRPEMap}
              variant="secondary"
              size="small"
            />
          </View>
          <Text style={styles.cardDescription}>
            Customize the relationship between RPE values and percentage of 1RM
          </Text>
          <View style={styles.rpeSettings}>
            {Object.entries(rpeMap)
              .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
              .map(([rpe, percentage]) =>
                renderRPESetting(parseFloat(rpe), percentage)
              )}
          </View>
        </Card>

        <Card style={styles.settingCard}>
          <Text style={styles.cardTitle}>Data Management</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Saved Presets:</Text>
            <Text style={styles.statValue}>{presetCount}</Text>
          </View>

          <BigButton
            title="Clear All Presets"
            onPress={clearAllPresets}
            variant="secondary"
            size="medium"
            disabled={presetCount === 0}
            style={styles.dangerButton}
          />
        </Card>

        <Card style={styles.settingCard}>
          <Text style={styles.cardTitle}>About BK8</Text>
          <Text style={styles.aboutText}>
            BenchKit 8 - Essential gym tools, completely offline.
          </Text>
          <Text style={styles.aboutText}>Version 1.0.0</Text>
        </Card>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'], // Extra padding at bottom for better scrolling
  },
  settingCard: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  unitButton: {
    flex: 1,
  },
  rpeSettings: {
    gap: SPACING.sm,
  },
  rpeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    minHeight: 48,
  },
  rpeLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    fontWeight: '500',
    minWidth: 80,
  },
  compactStepper: {
    width: 120, // Fixed width to prevent layout shifts
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dangerButton: {
    borderColor: COLORS.error,
  },
  aboutText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    lineHeight: 24,
  },
});
