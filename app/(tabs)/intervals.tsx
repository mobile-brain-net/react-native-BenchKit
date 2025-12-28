import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { keepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { Card } from '../../components/Card';
import { BigButton } from '../../components/BigButton';
import { ProgressRing } from '../../components/ProgressRing';
import { ReelStepper } from '../../components/ReelStepper';
import { DataStore } from '../../lib/storage';
import { formatDuration } from '../../lib/formulas';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

type IntervalState = 'setup' | 'running' | 'paused' | 'completed';
type IntervalType = 'EMOM' | 'AMRAP' | 'Tabata' | 'Custom';

interface IntervalConfig {
  type: IntervalType;
  rounds: number;
  workTime: number; // seconds
  restTime: number; // seconds
  totalTime: number; // seconds for AMRAP
}

export default function IntervalsScreen() {
  const [state, setState] = useState<IntervalState>('setup');
  const [config, setConfig] = useState<IntervalConfig>({
    type: 'EMOM',
    rounds: 10,
    workTime: 50,
    restTime: 10,
    totalTime: 1200, // 20 minutes
  });
  
  const [currentRound, setCurrentRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (Platform.OS !== 'web') {
        deactivateKeepAwake();
      }
    };
  }, []);

  const startTimer = () => {
    if (Platform.OS !== 'web') {
      keepAwake();
    }
    setState('running');
    startTimeRef.current = Date.now();
    
    if (config.type === 'EMOM') {
      setTimeRemaining(60);
      setIsWorkPhase(true);
    } else if (config.type === 'Tabata') {
      setTimeRemaining(config.workTime);
      setIsWorkPhase(true);
    } else if (config.type === 'AMRAP') {
      setTimeRemaining(config.totalTime);
      setIsWorkPhase(true);
    } else {
      setTimeRemaining(config.workTime);
      setIsWorkPhase(true);
    }
    
    intervalRef.current = setInterval(updateTimer, 100);
  };

  const updateTimer = () => {
    setTimeRemaining((prev) => {
      const newTime = prev - 0.1;
      
      if (newTime <= 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        if (config.type === 'EMOM') {
          if (currentRound >= config.rounds) {
            completeTimer();
            return 0;
          }
          setCurrentRound(r => r + 1);
          return 60;
        } else if (config.type === 'AMRAP') {
          completeTimer();
          return 0;
        } else if (config.type === 'Tabata') {
          if (isWorkPhase) {
            setIsWorkPhase(false);
            return config.restTime;
          } else {
            setIsWorkPhase(true);
            if (currentRound >= config.rounds) {
              completeTimer();
              return 0;
            }
            setCurrentRound(r => r + 1);
            return config.workTime;
          }
        } else {
          // Custom intervals
          if (isWorkPhase) {
            setIsWorkPhase(false);
            return config.restTime;
          } else {
            setIsWorkPhase(true);
            if (currentRound >= config.rounds) {
              completeTimer();
              return 0;
            }
            setCurrentRound(r => r + 1);
            return config.workTime;
          }
        }
      }
      
      return newTime;
    });
  };

  const pauseTimer = () => {
    setState('paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (Platform.OS !== 'web') {
      deactivateKeepAwake();
    }
  };

  const resumeTimer = () => {
    setState('running');
    if (Platform.OS !== 'web') {
      keepAwake();
    }
    intervalRef.current = setInterval(updateTimer, 100);
  };

  const stopTimer = () => {
    setState('setup');
    setCurrentRound(1);
    setTimeRemaining(0);
    setIsWorkPhase(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (Platform.OS !== 'web') {
      deactivateKeepAwake();
    }
  };

  const completeTimer = () => {
    setState('completed');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (Platform.OS !== 'web') {
      deactivateKeepAwake();
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const savePreset = () => {
    if (Platform.OS === 'web') {
      const name = window.prompt('Enter a name for this interval configuration:');
      if (name) {
        const store = DataStore.getInstance();
        store.savePreset(name, 'intervals', config).then(() => {
          Alert.alert('Saved!', `Preset "${name}" has been saved.`);
        });
      }
    } else {
      Alert.prompt(
        'Save Preset',
        'Enter a name for this interval configuration:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (name) => {
              if (name) {
                const store = DataStore.getInstance();
                await store.savePreset(name, 'intervals', config);
                Alert.alert('Saved!', `Preset "${name}" has been saved.`);
              }
            },
          },
        ]
      );
    }
  };

  const getProgress = () => {
    if (config.type === 'EMOM') {
      return (60 - timeRemaining) / 60;
    } else if (config.type === 'AMRAP') {
      return (config.totalTime - timeRemaining) / config.totalTime;
    } else {
      const phaseTime = isWorkPhase ? config.workTime : config.restTime;
      return (phaseTime - timeRemaining) / phaseTime;
    }
  };

  const renderSetup = () => (
    <ScrollView style={styles.scrollView}>
      <Card style={styles.configCard}>
        <Text style={styles.cardTitle}>Interval Type</Text>
        <View style={styles.typeButtons}>
          {(['EMOM', 'AMRAP', 'Tabata', 'Custom'] as IntervalType[]).map((type) => (
            <BigButton
              key={type}
              title={type}
              onPress={() => setConfig(c => ({ ...c, type }))}
              variant={config.type === type ? 'primary' : 'secondary'}
              size="small"
              style={styles.typeButton}
            />
          ))}
        </View>
      </Card>

      {config.type === 'EMOM' && (
        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Rounds</Text>
          <ReelStepper
            value={config.rounds}
            onValueChange={(rounds) => setConfig(c => ({ ...c, rounds }))}
            min={1}
            max={50}
          />
        </Card>
      )}

      {config.type === 'AMRAP' && (
        <Card style={styles.configCard}>
          <Text style={styles.cardTitle}>Total Time</Text>
          <ReelStepper
            value={config.totalTime / 60}
            onValueChange={(minutes) => setConfig(c => ({ ...c, totalTime: minutes * 60 }))}
            min={1}
            max={60}
            suffix=" min"
          />
        </Card>
      )}

      {(config.type === 'Tabata' || config.type === 'Custom') && (
        <>
          <Card style={styles.configCard}>
            <Text style={styles.cardTitle}>Work Time</Text>
            <ReelStepper
              value={config.workTime}
              onValueChange={(workTime) => setConfig(c => ({ ...c, workTime }))}
              min={5}
              max={300}
              suffix=" sec"
            />
          </Card>

          <Card style={styles.configCard}>
            <Text style={styles.cardTitle}>Rest Time</Text>
            <ReelStepper
              value={config.restTime}
              onValueChange={(restTime) => setConfig(c => ({ ...c, restTime }))}
              min={5}
              max={300}
              suffix=" sec"
            />
          </Card>

          <Card style={styles.configCard}>
            <Text style={styles.cardTitle}>Rounds</Text>
            <ReelStepper
              value={config.rounds}
              onValueChange={(rounds) => setConfig(c => ({ ...c, rounds }))}
              min={1}
              max={50}
            />
          </Card>
        </>
      )}

      <View style={styles.buttonRow}>
        <BigButton
          title="Save Preset"
          onPress={savePreset}
          variant="secondary"
          style={styles.flexButton}
        />
        <BigButton
          title="Start Timer"
          onPress={startTimer}
          variant="primary"
          style={styles.flexButton}
        />
      </View>
    </ScrollView>
  );

  const renderRunning = () => (
    <View style={styles.timerContainer}>
      <ProgressRing
        progress={getProgress()}
        size={280}
        strokeWidth={12}
      >
        <View style={styles.timerContent}>
          <Text style={styles.roundText}>
            Round {currentRound} / {config.rounds}
          </Text>
          <Text style={styles.timeText}>
            {formatDuration(Math.ceil(timeRemaining))}
          </Text>
          <Text style={styles.phaseText}>
            {config.type === 'AMRAP' ? 'GO!' : isWorkPhase ? 'WORK' : 'REST'}
          </Text>
        </View>
      </ProgressRing>

      <View style={styles.timerButtons}>
        <BigButton
          title="Pause"
          onPress={pauseTimer}
          variant="accent"
          style={styles.flexButton}
        />
        <BigButton
          title="Stop"
          onPress={stopTimer}
          variant="secondary"
          style={styles.flexButton}
        />
      </View>
    </View>
  );

  const renderPaused = () => (
    <View style={styles.timerContainer}>
      <ProgressRing
        progress={getProgress()}
        size={280}
        strokeWidth={12}
      >
        <View style={styles.timerContent}>
          <Text style={styles.roundText}>PAUSED</Text>
          <Text style={styles.timeText}>
            {formatDuration(Math.ceil(timeRemaining))}
          </Text>
        </View>
      </ProgressRing>

      <View style={styles.timerButtons}>
        <BigButton
          title="Resume"
          onPress={resumeTimer}
          variant="primary"
          style={styles.flexButton}
        />
        <BigButton
          title="Stop"
          onPress={stopTimer}
          variant="secondary"
          style={styles.flexButton}
        />
      </View>
    </View>
  );

  const renderCompleted = () => (
    <View style={styles.timerContainer}>
      <ProgressRing
        progress={1}
        size={280}
        strokeWidth={12}
      >
        <View style={styles.timerContent}>
          <Text style={styles.completedText}>COMPLETED!</Text>
          <Text style={styles.summaryText}>
            {config.rounds} rounds finished
          </Text>
        </View>
      </ProgressRing>

      <View style={styles.timerButtons}>
        <BigButton
          title="New Session"
          onPress={stopTimer}
          variant="primary"
          style={styles.flexButton}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Intervals Timer</Text>
      </View>

      {state === 'setup' && renderSetup()}
      {state === 'running' && renderRunning()}
      {state === 'paused' && renderPaused()}
      {state === 'completed' && renderCompleted()}
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
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  typeButton: {
    minWidth: 80,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  flexButton: {
    flex: 1,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  timerContent: {
    alignItems: 'center',
  },
  roundText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize['6xl'],
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  phaseText: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  completedText: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING['2xl'],
    width: '100%',
  },
});