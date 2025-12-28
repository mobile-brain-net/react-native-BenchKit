import { Units, PlateSet, BarType } from '../types';

// 1RM Calculations
export function calculateOneRM(weight: number, reps: number, formula: 'epley' | 'brzycki'): number {
  if (reps === 1) return weight;
  
  switch (formula) {
    case 'epley':
      return weight * (1 + reps / 30);
    case 'brzycki':
      return weight * (36 / (37 - reps));
    default:
      return weight;
  }
}

export function generatePercentageTable(oneRM: number): Array<{ percentage: number; weight: number }> {
  const percentages = [];
  for (let i = 50; i <= 95; i += 5) {
    percentages.push({
      percentage: i,
      weight: Math.round((oneRM * i / 100) * 10) / 10,
    });
  }
  return percentages;
}

// Plate Calculations
export const STANDARD_PLATES = {
  kg: [25, 20, 15, 10, 5, 2.5, 1.25, 1, 0.5],
  lb: [45, 35, 25, 10, 5, 2.5, 1.25, 1],
};

export const STANDARD_BARS: Record<string, BarType> = {
  'olympic-20': { weight: 20, name: 'Olympic (20kg)' },
  'olympic-15': { weight: 15, name: 'Women\'s Olympic (15kg)' },
  'olympic-10': { weight: 10, name: 'Junior Olympic (10kg)' },
  'standard-45': { weight: 45, name: 'Olympic (45lb)' },
  'standard-35': { weight: 35, name: 'Women\'s Olympic (35lb)' },
};

export function calculatePlates(
  targetWeight: number,
  barWeight: number,
  availablePlates: number[],
  units: 'kg' | 'lb'
): { plates: PlateSet[]; totalWeight: number; difference: number } {
  const weightPerSide = (targetWeight - barWeight) / 2;
  
  if (weightPerSide <= 0) {
    return { plates: [], totalWeight: barWeight, difference: targetWeight - barWeight };
  }

  const plates: PlateSet[] = [];
  let remaining = weightPerSide;
  
  // Sort plates in descending order
  const sortedPlates = [...availablePlates].sort((a, b) => b - a);
  
  for (const plateWeight of sortedPlates) {
    const count = Math.floor(remaining / plateWeight);
    if (count > 0) {
      plates.push({ weight: plateWeight, count });
      remaining -= count * plateWeight;
    }
  }

  const actualWeightPerSide = plates.reduce((sum, p) => sum + p.weight * p.count, 0);
  const totalWeight = barWeight + actualWeightPerSide * 2;
  
  return {
    plates,
    totalWeight,
    difference: targetWeight - totalWeight,
  };
}

// Pace Calculations
export function convertDistance(distance: number, fromUnit: 'km' | 'mi', toUnit: 'km' | 'mi'): number {
  if (fromUnit === toUnit) return distance;
  return fromUnit === 'km' ? distance * 0.621371 : distance * 1.60934;
}

export function calculatePace(distance: number, timeSeconds: number, units: 'km' | 'mi'): string {
  const paceSeconds = timeSeconds / distance;
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.round(paceSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/${units}`;
}

export function calculateTime(distance: number, paceMinutes: number, paceSeconds: number): number {
  const paceInSeconds = paceMinutes * 60 + paceSeconds;
  return distance * paceInSeconds;
}

export function calculateDistance(timeSeconds: number, paceMinutes: number, paceSeconds: number): number {
  const paceInSeconds = paceMinutes * 60 + paceSeconds;
  return timeSeconds / paceInSeconds;
}

// Progression Calculations
export function calculateProgression(
  currentWeight: number,
  increment: number,
  availablePlates: number[],
  barWeight: number
): { suggestedWeight: number; plates: PlateSet[]; rounded: boolean } {
  const targetWeight = currentWeight + increment;
  const result = calculatePlates(targetWeight, barWeight, availablePlates, 'kg');
  
  return {
    suggestedWeight: result.totalWeight,
    plates: result.plates,
    rounded: Math.abs(result.difference) > 0.1,
  };
}

// Time formatting utilities
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}