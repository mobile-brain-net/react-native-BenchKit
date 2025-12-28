import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Card } from '../../components/Card';
import { BigButton } from '../../components/BigButton';
import { ReelStepper } from '../../components/ReelStepper';
import { DataStore } from '../../lib/storage';
import { calculateProgression, STANDARD_PLATES, STANDARD_BARS } from '../../lib/formulas';
import { Units, PlateSet } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export default function ProgressionScreen() {
  const [currentWeight, setCurrentWeight] = useState(100);
  const [increment, setIncrement] = useState(2.5);
  const [selectedBar, setSelectedBar] = useState('olympic-20');
  const [units, setUnits] = useState<Units['weight']>('kg');
  const [progression, setProgression] = useState<{
    suggestedWeight: number;
    plates: PlateSet[];
    rounded: boolean;
  } | null>(null);

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    calculateNextSession();
  }, [currentWeight, increment, selectedBar, units]);

  const loadUnits = async () => {
    const store = DataStore.getInstance();
    await store.initialize();
    const storeUnits = store.getStore().units;
    setUnits(storeUnits.weight);
  };

  const calculateNextSession = () => {
    const bar = STANDARD_BARS[selectedBar];
    const availablePlates = STANDARD_PLATES[units];
    const result = calculateProgression(currentWeight, increment, availablePlates, bar.weight);
    setProgression(result);
  };

  const savePreset = () => {
    if (Platform.OS === 'web') {
      const name = window.prompt('Enter a name for this progression configuration:');
      if (name) {
        const store = DataStore.getInstance();
        store.savePreset(name, 'progression', {
          currentWeight,
          increment,
          selectedBar,
          units,
        }).then(() => {
          Alert.alert('Saved!', `Preset "${name}" has been saved.`);
        });
      }
    } else {
      Alert.prompt(
        'Save Preset',
        'Enter a name for this progression configuration:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (name) => {
              if (name) {
                const store = DataStore.getInstance();
                await store.savePreset(name, 'progression', {
                  currentWeight,
                  increment,
                  selectedBar,
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

  const applyProgression = () => {
    if (progression) {
      setCurrentWeight(progression.suggestedWeight);
      Alert.alert('Applied!', 'Current weight updated to next session target.');
    }
  };

  const getBarOptions = () => {
    return Object.entries(STANDARD_BARS).filter(([key, bar]) => {
      if (units === 'kg') {
        return key.includes('olympic') && !key.includes('45') && !key.includes('35');
      } else {
        return key.includes('standard') || key.includes('45') || key.includes('35');
      }
    });
  };

  const renderPlateRow = (plateSet: PlateSet) => {
    const plateColors = {
      25: '#00BCD4', 20: '#FFD700', 15: '#00BCD4', 10: '#FFD700',
      5: '#00BCD4', 2.5: '#FFD700', 1.25: '#00BCD4', 1: '#FFD700',
      0.5: '#00BCD4', 45: '#00BCD4', 35: '#FFD700', 25: '#00BCD4',
    } as Record<number, string>;

    return (
      <View key={plateSet.weight} style={styles.plateRow}>
        <View style={styles.plateInfo}>
          <View 
            style={[
              styles.plateIndicator, 
              { backgroundColor: plateColors[plateSet.weight] || COLORS.border }
            ]} 
          />
          <Text style={styles.plateWeight}>
            {plateSet.weight}{units}
          </Text>
        </View>
        <Text style={styles.plateCount}>×{plateSet.count}</Text>
        <Text style={styles.plateTotal}>
          {(plateSet.weight * plateSet.count).toFixed(1)}{units}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progression Planner</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Current Weight</Text>
          <ReelStepper
            value={currentWeight}
            onValueChange={setCurrentWeight}
            min={10}
            max={500}
            step={units === 'kg' ? 2.5 : 5}
            suffix={` ${units}`}
            precision={1}
          />
        </Card>

        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Increment</Text>
          <ReelStepper
            value={increment}
            onValueChange={setIncrement}
            min={0.5}
            max={20}
            step={units === 'kg' ? 0.5 : 1}
            suffix={` ${units}`}
            precision={1}
          />
        </Card>

        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Units</Text>
          <View style={styles.unitButtons}>
            <BigButton
              title="KG"
              onPress={() => setUnits('kg')}
              variant={units === 'kg' ? 'primary' : 'secondary'}
              size="small"
              style={styles.unitButton}
            />
            <BigButton
              title="LB"
              onPress={() => setUnits('lb')}
              variant={units === 'lb' ? 'primary' : 'secondary'}
              size="small"
              style={styles.unitButton}
            />
          </View>
        </Card>

        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Bar Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.barButtons}>
              {getBarOptions().map(([key, bar]) => (
                <BigButton
                  key={key}
                  title={bar.name}
                  onPress={() => setSelectedBar(key)}
                  variant={selectedBar === key ? 'primary' : 'secondary'}
                  size="small"
                  style={styles.barButton}
                />
              ))}
            </View>
          </ScrollView>
        </Card>

        {progression && (
          <Card style={styles.resultCard}>
            <Text style={styles.cardTitle}>Next Session</Text>
            
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Current:</Text>
              <Text style={styles.summaryValue}>{currentWeight}{units}</Text>
            </View>
            
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Target:</Text>
              <Text style={styles.summaryValue}>
                {(currentWeight + increment).toFixed(1)}{units}
              </Text>
            </View>
            
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Suggested:</Text>
              <Text style={[
                styles.summaryValue,
                progression.rounded && styles.summaryRounded
              ]}>
                {progression.suggestedWeight.toFixed(1)}{units}
              </Text>
            </View>
            
            {progression.rounded && (
              <Text style={styles.roundingNote}>
                * Rounded to nearest available plates
              </Text>
            )}

            <Text style={styles.plateHeader}>Plates Per Side:</Text>
            {progression.plates.length > 0 ? (
              <View style={styles.plateList}>
                {progression.plates.map(renderPlateRow)}
              </View>
            ) : (
              <Text style={styles.noPlatesText}>Bar only</Text>
            )}
          </Card>
        )}

        <View style={styles.buttonRow}>
          <BigButton
            title="Save Preset"
            onPress={savePreset}
            variant="secondary"
            style={styles.flexButton}
          />
          <BigButton
            title="Apply & Next"
            onPress={applyProgression}
            variant="primary"
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
  unitButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  unitButton: {
    flex: 1,
  },
  barButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  barButton: {
    minWidth: 140,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryRounded: {
    color: COLORS.accent,
  },
  roundingNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  plateHeader: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  plateList: {
    gap: SPACING.sm,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  plateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plateIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  plateWeight: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    fontWeight: '500',
  },
  plateCount: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginRight: SPACING.lg,
  },
  plateTotal: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
  },
  noPlatesText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.lg,
  },
  flexButton: {
    flex: 1,
  },
});