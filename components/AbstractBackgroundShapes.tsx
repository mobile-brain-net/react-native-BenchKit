import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Polygon } from 'react-native-svg';
import { COLORS } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function AbstractBackgroundShapes() {
  return (
    <View style={styles.container}>
      <Svg width={screenWidth} height={screenHeight} style={styles.svg}>
        {/* Crown-like shape 1 - Top left */}
        <Polygon
          points="50,100 150,50 250,80 200,180 100,200"
          fill={COLORS.shadow}
          opacity={0.3}
          transform="translate(6, 6)"
        />
        <Polygon
          points="50,100 150,50 250,80 200,180 100,200"
          fill={COLORS.accent}
          opacity={0.15}
        />

        {/* Angular rectangle 1 - Top right */}
        <Rect
          x={screenWidth - 200}
          y={80}
          width="120"
          height="80"
          fill={COLORS.shadow}
          opacity={0.3}
          transform={`rotate(25 ${screenWidth - 140} 120) translate(4, 4)`}
        />
        <Rect
          x={screenWidth - 200}
          y={80}
          width="120"
          height="80"
          fill={COLORS.accent}
          opacity={0.15}
          transform={`rotate(25 ${screenWidth - 140} 120)`}
        />

        {/* Crown-like shape 2 - Middle left */}
        <Polygon
          points="0,300 80,250 160,280 140,380 20,400"
          fill={COLORS.shadow}
          opacity={0.3}
          transform="translate(5, 5)"
        />
        <Polygon
          points="0,300 80,250 160,280 140,380 20,400"
          fill={COLORS.accent}
          opacity={0.15}
        />

        {/* Angular rectangle 2 - Center */}
        <Rect
          x={screenWidth / 2 - 60}
          y={screenHeight / 2 - 40}
          width="100"
          height="60"
          fill={COLORS.shadow}
          opacity={0.3}
          transform={`rotate(-15 ${screenWidth / 2 - 10} ${screenHeight / 2 - 10}) translate(3, 3)`}
        />
        <Rect
          x={screenWidth / 2 - 60}
          y={screenHeight / 2 - 40}
          width="100"
          height="60"
          fill={COLORS.accent}
          opacity={0.15}
          transform={`rotate(-15 ${screenWidth / 2 - 10} ${screenHeight / 2 - 10})`}
        />

        {/* Crown-like shape 3 - Bottom right */}
        <Polygon
          points={`${screenWidth - 150},${screenHeight - 200} ${screenWidth - 50},${screenHeight - 250} ${screenWidth},${screenHeight - 220} ${screenWidth - 20},${screenHeight - 120} ${screenWidth - 120},${screenHeight - 100}`}
          fill={COLORS.shadow}
          opacity={0.3}
          transform="translate(4, 4)"
        />
        <Polygon
          points={`${screenWidth - 150},${screenHeight - 200} ${screenWidth - 50},${screenHeight - 250} ${screenWidth},${screenHeight - 220} ${screenWidth - 20},${screenHeight - 120} ${screenWidth - 120},${screenHeight - 100}`}
          fill={COLORS.accent}
          opacity={0.15}
        />

        {/* Angular rectangle 3 - Bottom left */}
        <Rect
          x={80}
          y={screenHeight - 180}
          width="90"
          height="70"
          fill={COLORS.shadow}
          opacity={0.3}
          transform={`rotate(35 125 ${screenHeight - 145}) translate(5, 5)`}
        />
        <Rect
          x={80}
          y={screenHeight - 180}
          width="90"
          height="70"
          fill={COLORS.accent}
          opacity={0.15}
          transform={`rotate(35 125 ${screenHeight - 145})`}
        />

        {/* Small accent shapes */}
        <Rect
          x={screenWidth - 100}
          y={screenHeight / 3}
          width="40"
          height="40"
          fill={COLORS.shadow}
          opacity={0.3}
          transform={`rotate(45 ${screenWidth - 80} ${screenHeight / 3 + 20}) translate(2, 2)`}
        />
        <Rect
          x={screenWidth - 100}
          y={screenHeight / 3}
          width="40"
          height="40"
          fill={COLORS.accent}
          opacity={0.2}
          transform={`rotate(45 ${screenWidth - 80} ${screenHeight / 3 + 20})`}
        />

        <Polygon
          points="30,500 70,480 90,520 50,540"
          fill={COLORS.shadow}
          opacity={0.3}
          transform="translate(3, 3)"
        />
        <Polygon
          points="30,500 70,480 90,520 50,540"
          fill={COLORS.accent}
          opacity={0.2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -2,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});