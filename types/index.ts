export type Units = { 
  weight: "kg" | "lb"; 
  distance: "km" | "mi"; 
};

export type ToolKey = 
  | "intervals" 
  | "platemath" 
  | "onerm" 
  | "rpe" 
  | "stopwatch" 
  | "repcounter" 
  | "pacesplit" 
  | "progression";

export type Preset = { 
  id: string; 
  name: string; 
  tool: ToolKey; 
  payload: any; 
  createdAt: number; 
};

export type Store = {
  units: Units;
  rpeMap: Record<number, number>; // RPE 10 -> 100%, 9 -> 96%, etc.
  presets: Preset[];
  lastUsed?: Record<ToolKey, any>;
};

export type IntervalType = 'EMOM' | 'AMRAP' | 'Tabata' | 'Custom';

export type PlateSet = {
  weight: number;
  count: number;
};

export type OneRMFormula = 'epley' | 'brzycki';

export type LapTime = {
  id: string;
  lap: number;
  split: number;
  total: number;
};

export type BarType = {
  weight: number;
  name: string;
};
</types>