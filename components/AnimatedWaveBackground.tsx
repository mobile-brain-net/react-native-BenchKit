import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withRepeat, 
  withTiming,
  useDerivedValue
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function AnimatedWaveBackground() {
  const animationValue = useSharedValue(0);

  useEffect(() => {
    animationValue.value = withRepeat(
      withTiming(1, { duration: 8000 }),
      -1,
      false
    );
  }, []);

  const createWavePath = (offset: number, amplitude: number, frequency: number) => {
    const points = [];
    const step = screenWidth / 100;
    
    for (let x = 0; x <= screenWidth + 50; x += step) {
      const y = screenHeight * 0.7 + 
        Math.sin((x / screenWidth) * frequency * Math.PI + offset) * amplitude;
      points.push(`${x},${y}`);
    }
    
    return `M0,${screenHeight} L${points.join(' L')} L${screenWidth + 50},${screenHeight} Z`;
  };

  const wave1AnimatedProps = useAnimatedProps(() => {
    const offset = animationValue.value * Math.PI * 2;
    return {
      d: createWavePath(offset, 30, 2),
    };
  });

  const wave2AnimatedProps = useAnimatedProps(() => {
    const offset = animationValue.value * Math.PI * 2 + Math.PI;
    return {
      d: createWavePath(offset, 25, 1.5),
    };
  });

  const wave3AnimatedProps = useAnimatedProps(() => {
    const offset = animationValue.value * Math.PI * 2 + Math.PI * 0.5;
    return {
      d: createWavePath(offset, 35, 2.5),
    };
  });

  // For web compatibility, use static waves
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Svg width={screenWidth} height={screenHeight} style={styles.svg}>
          <Defs>
            <LinearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={COLORS.waveYellow} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={COLORS.waveBlue} stopOpacity="0.4" />
            </LinearGradient>
            <LinearGradient id="waveGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={COLORS.waveBlue} stopOpacity="0.5" />
              <Stop offset="100%" stopColor={COLORS.waveYellow} stopOpacity="0.3" />
            </LinearGradient>
            <LinearGradient id="waveGradient3" x1="50%" y1="0%" x2="50%" y2="100%">
              <Stop offset="0%" stopColor={COLORS.waveYellow} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={COLORS.waveBlue} stopOpacity="0.6" />
            </LinearGradient>
          </Defs>
          
          <Path
            d={createWavePath(0, 30, 2)}
            fill="url(#waveGradient1)"
          />
          <Path
            d={createWavePath(Math.PI, 25, 1.5)}
            fill="url(#waveGradient2)"
          />
          <Path
            d={createWavePath(Math.PI * 0.5, 35, 2.5)}
            fill="url(#waveGradient3)"
          />
        </Svg>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={screenWidth} height={screenHeight} style={styles.svg}>
        <Defs>
          <LinearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.waveYellow} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={COLORS.waveBlue} stopOpacity="0.4" />
          </LinearGradient>
          <LinearGradient id="waveGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.waveBlue} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={COLORS.waveYellow} stopOpacity="0.3" />
          </LinearGradient>
          <LinearGradient id="waveGradient3" x1="50%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.waveYellow} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={COLORS.waveBlue} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        
        <AnimatedPath
          animatedProps={wave1AnimatedProps}
          fill="url(#waveGradient1)"
        />
        <AnimatedPath
          animatedProps={wave2AnimatedProps}
          fill="url(#waveGradient2)"
        />
        <AnimatedPath
          animatedProps={wave3AnimatedProps}
          fill="url(#waveGradient3)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});