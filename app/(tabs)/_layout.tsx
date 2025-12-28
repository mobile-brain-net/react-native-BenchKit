import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Timer, Calculator, Target, Gauge, Clock, Hash, Activity, TrendingUp, Chrome as Home, Settings } from 'lucide-react-native';
import { AbstractBackgroundShapes } from '../../components/AbstractBackgroundShapes';

const COLORS = {
  background: '#FFFFFF',
  surface: '#F0F0F0',
  text: '#333333',
  primary: '#00BCD4',
  accent: '#FFD700',
  border: '#CCCCCC',
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <AbstractBackgroundShapes />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            {
              paddingBottom: insets.bottom + 8, // Add safe area bottom + base padding
              height: 75 + insets.bottom, // Adjust total height to accommodate safe area
            }
          ],
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.text,
          tabBarItemStyle: styles.tabBarItem,
          tabBarShowLabel: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="intervals"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Timer size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="plates"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Calculator size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="onerm"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Target size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rpe"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Gauge size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stopwatch"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Clock size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="counter"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Hash size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="pace"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Activity size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="progression"
          options={{
            tabBarIcon: ({ size, color }) => (
              <TrendingUp size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 8, // Base padding (will be overridden by dynamic padding)
    height: 75, // Base height (will be adjusted dynamically)
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabBarItem: {
    paddingTop: 2,
  },
});