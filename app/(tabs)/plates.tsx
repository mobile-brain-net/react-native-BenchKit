import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Card } from '../../components/Card';
import { BigButton } from '../../components/BigButton';
import { ReelStepper } from '../../components/ReelStepper';
import { DataStore } from '../../lib/storage';
import { calculatePlates, STANDARD_PLATES, STANDARD_BARS } from '../../lib/formulas';
import { Units, PlateSet, BarType } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export default function PlatesScreen() {
  const [targetWeight, setTargetWeight] = useState(100);
  const [selectedBar, setSelectedBar] = useState('olympic-20');
  const [units, setUnits] = useState<Units['weight']>('kg');
  const [result, setResult] = useState<{
    plates: PlateSet[];
    totalWeight: number;
    difference: number;
  } | null>(null);

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    calculatePlateConfiguration();
  }, [targetWeight, selectedBar, units]);

  const loadUnits = async () => {
    const store = DataStore.getInstance();
    await store.initialize();
    const storeUnits = store.getStore().units;
    setUnits(storeUnits.weight);
  };

  const calculatePlateConfiguration = () => {
    const bar = STANDARD_BARS[selectedBar];
    const availablePlates = STANDARD_PLATES[units];
    const plateResult = calculatePlates(targetWeight, bar.weight, availablePlates, units);
    setResult(plateResult);
  };

  const savePreset = () => {
    if (Platform.OS === 'web') {
      const name = window.prompt('Enter a name for this plate configuration:');
      if (name) {
        const store = DataStore.getInstance();
        store.savePreset(name, 'platemath', {
          targetWeight,
          selectedBar,
          units,
        }).then(() => {
          Alert.alert('Saved!', `Preset "${name}" has been saved.`);
        });
      }
    } else {
      Alert.prompt(
        'Save Preset',
        'Enter a name for this plate configuration:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (name) => {
              if (name) {
                const store = DataStore.getInstance();
                await store.savePreset(name, 'platemath', {
                  targetWeight,
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
        <Text style={styles.title}>Plate Calculator</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Target Weight</Text>
          <ReelStepper
            value={targetWeight}
            onValueChange={setTargetWeight}
            min={10}
            max={500}
            step={units === 'kg' ? 2.5 : 5}
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

        {result && (
          <Card style={styles.resultCard}>
            <Text style={styles.cardTitle}>Plate Configuration</Text>
            
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Target:</Text>
              <Text style={styles.summaryValue}>{targetWeight}{units}</Text>
            </View>
            
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Actual:</Text>
              <Text style={[
                styles.summaryValue,
                result.difference !== 0 && styles.summaryDifferent
              ]}>
                {result.totalWeight.toFixed(1)}{units}
              </Text>
            </View>
            
            {result.difference !== 0 && (
              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>Difference:</Text>
                <Text style={[
                  styles.summaryValue,
                  result.difference > 0 ? styles.summaryUnder : styles.summaryOver
                ]}>
                  {result.difference > 0 ? '-' : '+'}{Math.abs(result.difference).toFixed(1)}{units}
                </Text>
              </View>
            )}

            <Text style={styles.plateHeader}>Per Side:</Text>
            {result.plates.length > 0 ? (
              <View style={styles.plateList}>
                {result.plates.map(renderPlateRow)}
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
  summaryDifferent: {
    color: COLORS.accent,
  },
  summaryUnder: {
    color: COLORS.warning,
  },
  summaryOver: {
    color: COLORS.success,
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
    marginTop: SPACING.lg,
  },
  flexButton: {
    flex: 1,
  },
});