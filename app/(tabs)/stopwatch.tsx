import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Card } from '../../components/Card';
import { BigButton } from '../../components/BigButton';
import { formatTime } from '../../lib/formulas';
import { LapTime } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

type StopwatchState = 'stopped' | 'running' | 'paused';

export default function StopwatchScreen() {
  const [state, setState] = useState<StopwatchState>('stopped');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startStopwatch = () => {
    setState('running');
    startTimeRef.current = Date.now() - pausedTimeRef.current;
    intervalRef.current = setInterval(() => {
      const currentTime = Date.now() - (startTimeRef.current || 0);
      setElapsedTime(currentTime / 1000);
    }, 10);
  };

  const pauseStopwatch = () => {
    setState('paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    pausedTimeRef.current = elapsedTime * 1000;
  };

  const stopStopwatch = () => {
    setState('stopped');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setElapsedTime(0);
    setLapTimes([]);
    pausedTimeRef.current = 0;
  };

  const recordLap = () => {
    const lapNumber = lapTimes.length + 1;
    const totalTime = elapsedTime;
    const splitTime = lapTimes.length === 0 
      ? totalTime 
      : totalTime - lapTimes[lapTimes.length - 1].total;
    
    const newLap: LapTime = {
      id: Date.now().toString(),
      lap: lapNumber,
      split: splitTime,
      total: totalTime,
    };
    
    setLapTimes(prev => [...prev, newLap]);
  };

  const exportLaps = async () => {
    if (lapTimes.length === 0) {
      Alert.alert('No Data', 'No lap times to export.');
      return;
    }

    let exportText = 'BK8 Stopwatch Export\n';
    exportText += `Total Time: ${formatTime(elapsedTime)}\n\n`;
    exportText += 'Lap\tSplit\tTotal\n';
    
    lapTimes.forEach(lap => {
      exportText += `${lap.lap}\t${formatTime(lap.split)}\t${formatTime(lap.total)}\n`;
    });
    
    await Clipboard.setStringAsync(exportText);
    Alert.alert('Exported!', 'Lap times copied to clipboard.');
  };

  const renderLapRow = (lap: LapTime) => (
    <View key={lap.id} style={styles.lapRow}>
      <Text style={styles.lapNumber}>#{lap.lap}</Text>
      <Text style={styles.lapSplit}>{formatTime(lap.split)}</Text>
      <Text style={styles.lapTotal}>{formatTime(lap.total)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stopwatch</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.timerCard} variant="large">
          <Text style={styles.timeDisplay}>
            {formatTime(elapsedTime)}
          </Text>
          <Text style={styles.stateText}>
            {state === 'stopped' ? 'Ready' : 
             state === 'running' ? 'Running' : 'Paused'}
          </Text>
        </Card>

        <View style={styles.controlButtons}>
          {state === 'stopped' && (
            <BigButton
              title="Start"
              onPress={startStopwatch}
              variant="primary"
              size="large"
            />
          )}
          
          {state === 'running' && (
            <>
              <BigButton
                title="Lap"
                onPress={recordLap}
                variant="accent"
                style={styles.flexButton}
              />
              <BigButton
                title="Pause"
                onPress={pauseStopwatch}
                variant="secondary"
                style={styles.flexButton}
              />
            </>
          )}
          
          {state === 'paused' && (
            <>
              <BigButton
                title="Resume"
                onPress={startStopwatch}
                variant="primary"
                style={styles.flexButton}
              />
              <BigButton
                title="Stop"
                onPress={stopStopwatch}
                variant="secondary"
                style={styles.flexButton}
              />
            </>
          )}
        </View>

        {lapTimes.length > 0 && (
          <Card style={styles.lapCard}>
            <View style={styles.lapHeader}>
              <Text style={styles.cardTitle}>Lap Times</Text>
              <BigButton
                title="Export"
                onPress={exportLaps}
                variant="secondary"
                size="small"
              />
            </View>
            
            <View style={styles.lapTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Lap</Text>
                <Text style={styles.tableHeaderText}>Split</Text>
                <Text style={styles.tableHeaderText}>Total</Text>
              </View>
              <ScrollView style={styles.lapList} nestedScrollEnabled>
                {lapTimes.slice().reverse().map(renderLapRow)}
              </ScrollView>
            </View>
          </Card>
        )}
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
  timerCard: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  timeDisplay: {
    fontSize: TYPOGRAPHY.fontSize['6xl'],
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stateText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  flexButton: {
    flex: 1,
  },
  lapCard: {
    maxHeight: 400,
  },
  lapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  lapTable: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
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
  lapList: {
    maxHeight: 250,
  },
  lapRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  lapNumber: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  lapSplit: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  lapTotal: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
});