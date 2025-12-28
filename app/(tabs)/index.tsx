import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DataStore } from '../../lib/storage';
import { Preset } from '../../types';
import { Card } from '../../components/Card';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import {
  Timer,
  Calculator,
  Target,
  Gauge,
  Clock,
  Hash,
  Activity,
  TrendingUp,
} from 'lucide-react-native';

const TOOL_CONFIGS = [
  {
    key: 'intervals',
    title: 'Intervals Timer',
    icon: Timer,
    description: 'EMOM, AMRAP, Tabata',
  },
  {
    key: 'platemath',
    title: 'Plate Calculator',
    icon: Calculator,
    description: 'Load calculations',
  },
  {
    key: 'onerm',
    title: '1RM Calculator',
    icon: Target,
    description: 'Max rep estimates',
  },
  {
    key: 'rpe',
    title: 'RPE Converter',
    icon: Gauge,
    description: 'RPE to %1RM',
  },
  {
    key: 'stopwatch',
    title: 'Stopwatch',
    icon: Clock,
    description: 'Lap timing',
  },
  {
    key: 'repcounter',
    title: 'Rep Counter',
    icon: Hash,
    description: 'Count your reps',
  },
  {
    key: 'pacesplit',
    title: 'Pace Calculator',
    icon: Activity,
    description: 'Running/rowing pace',
  },
  {
    key: 'progression',
    title: 'Progression Planner',
    icon: TrendingUp,
    description: 'Next session weights',
  },
];

export default function HomeScreen() {
  const [recentPresets, setRecentPresets] = useState<Preset[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadRecentPresets();
    }, [])
  );

  const loadRecentPresets = async () => {
    const store = DataStore.getInstance();
    await store.initialize();
    const presets = store.getPresets().slice(0, 4);
    setRecentPresets(presets);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>BenchKit 8</Text>
          <Text style={styles.subtitle}>
            Essential gym tools, offline-ready
          </Text>
        </View>

        {recentPresets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Presets</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.presetRow}>
                {recentPresets.map((preset) => (
                  <Card key={preset.id} style={styles.presetCard}>
                    <Text style={styles.presetName}>{preset.name}</Text>
                    <Text style={styles.presetTool}>{preset.tool}</Text>
                  </Card>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tools</Text>
          <View style={styles.toolsGrid}>
            {TOOL_CONFIGS.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <TouchableOpacity key={tool.key} style={styles.toolCard}>
                  <Card style={styles.toolCardInner}>
                    <View style={styles.toolIcon}>
                      <IconComponent size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.toolTitle}>{tool.title}</Text>
                    <Text style={styles.toolDescription}>
                      {tool.description}
                    </Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING['3xl'],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['5xl'],
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.lg,
    marginBottom: SPACING.md,
  },
  presetRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  presetCard: {
    width: 140,
    minHeight: 80,
  },
  presetName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  presetTool: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  toolCard: {
    width: '47%',
  },
  toolCardInner: {
    minHeight: 120,
    alignItems: 'center',
    padding: SPACING.md,
  },
  toolIcon: {
    marginBottom: SPACING.sm,
  },
  toolTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  toolDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
