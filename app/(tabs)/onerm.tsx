import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Card } from '../../components/Card';
import { BigButton } from '../../components/BigButton';
import { ReelStepper } from '../../components/ReelStepper';
import { DataStore } from '../../lib/storage';
import { calculateOneRM, generatePercentageTable } from '../../lib/formulas';
import { OneRMFormula, Units } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export default function OneRMScreen() {
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);
  const [formula, setFormula] = useState<OneRMFormula>('epley');
  const [units, setUnits] = useState<Units['weight']>('kg');
  const [oneRM, setOneRM] = useState(0);
  const [percentageTable, setPercentageTable] = useState<Array<{ percentage: number; weight: number }>>([]);

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    const calculated1RM = calculateOneRM(weight, reps, formula);
    setOneRM(calculated1RM);
    setPercentageTable(generatePercentageTable(calculated1RM));
  }, [weight, reps, formula]);

  const loadUnits = async () => {
    const store = DataStore.getInstance();
    await store.initialize();
    const storeUnits = store.getStore().units;
    setUnits(storeUnits.weight);
  };

  const savePreset = () => {
    if (Platform.OS === 'web') {
      const name = window.prompt('Enter a name for this 1RM configuration:');
      if (name) {
        const store = DataStore.getInstance();
        store.savePreset(name, 'onerm', {
          weight,
          reps,
          formula,
          units,
        }).then(() => {
          Alert.alert('Saved!', `Preset "${name}" has been saved.`);
        });
      }
    } else {
      Alert.prompt(
        'Save Preset',
        'Enter a name for this 1RM configuration:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (name) => {
              if (name) {
                const store = DataStore.getInstance();
                await store.savePreset(name, 'onerm', {
                  weight,
                  reps,
                  formula,
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

  const renderPercentageRow = (item: { percentage: number; weight: number }) => (
    <View key={item.percentage} style={styles.percentageRow}>
      <Text style={styles.percentageText}>{item.percentage}%</Text>
      <Text style={styles.percentageWeight}>
        {item.weight.toFixed(1)}{units}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>1RM Calculator</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Weight Lifted</Text>
          <ReelStepper
            value={weight}
            onValueChange={setWeight}
            min={10}
            max={500}
            step={units === 'kg' ? 2.5 : 5}
            suffix={` ${units}`}
            precision={1}
          />
        </Card>

        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Reps Completed</Text>
          <ReelStepper
            value={reps}
            onValueChange={setReps}
            min={1}
            max={20}
          />
        </Card>

        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Formula</Text>
          <View style={styles.formulaButtons}>
            <BigButton
              title="Epley"
              onPress={() => setFormula('epley')}
              variant={formula === 'epley' ? 'primary' : 'secondary'}
              size="small"
              style={styles.formulaButton}
            />
            <BigButton
              title="Brzycki"
              onPress={() => setFormula('brzycki')}
              variant={formula === 'brzycki' ? 'primary' : 'secondary'}
              size="small"
              style={styles.formulaButton}
            />
          </View>
          <Text style={styles.formulaDescription}>
            {formula === 'epley' 
              ? 'Epley: 1RM = weight × (1 + reps/30)'
              : 'Brzycki: 1RM = weight × (36 / (37 - reps))'
            }
          </Text>
        </Card>

        <Card style={styles.resultCard}>
          <Text style={styles.cardTitle}>Estimated 1RM</Text>
          <View style={styles.oneRMContainer}>
            <Text style={styles.oneRMValue}>
              {oneRM.toFixed(1)}
            </Text>
            <Text style={styles.oneRMUnits}>{units}</Text>
          </View>
        </Card>

        <Card style={styles.tableCard}>
          <Text style={styles.cardTitle}>Percentage Table</Text>
          <View style={styles.percentageTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>%1RM</Text>
              <Text style={styles.tableHeaderText}>Weight</Text>
            </View>
            {percentageTable.map(renderPercentageRow)}
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
  formulaButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  formulaButton: {
    flex: 1,
  },
  formulaDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  oneRMContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  oneRMValue: {
    fontSize: TYPOGRAPHY.fontSize['6xl'],
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  oneRMUnits: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  percentageTable: {
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
  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  percentageText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    fontWeight: '500',
  },
  percentageWeight: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  buttonRow: {
    marginTop: SPACING.lg,
  },
  flexButton: {
    flex: 1,
  },
});