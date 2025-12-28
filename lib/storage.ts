import AsyncStorage from '@react-native-async-storage/async-storage';
import { Store, Units, Preset, ToolKey } from '../types';

const STORAGE_KEY = 'bk8_store';

const DEFAULT_RPE_MAP: Record<number, number> = {
  10: 100,
  9.5: 98,
  9: 96,
  8.5: 94,
  8: 92,
  7.5: 89,
  7: 86,
  6.5: 83,
  6: 80,
};

const DEFAULT_STORE: Store = {
  units: { weight: 'kg', distance: 'km' },
  rpeMap: DEFAULT_RPE_MAP,
  presets: [],
  lastUsed: {},
};

export class DataStore {
  private static instance: DataStore;
  private store: Store = DEFAULT_STORE;
  private listeners: ((store: Store) => void)[] = [];

  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.store = { ...DEFAULT_STORE, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load store:', error);
    }
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
      this.listeners.forEach(listener => listener(this.store));
    } catch (error) {
      console.error('Failed to save store:', error);
    }
  }

  subscribe(listener: (store: Store) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getStore(): Store {
    return this.store;
  }

  async setUnits(units: Partial<Units>): Promise<void> {
    this.store.units = { ...this.store.units, ...units };
    await this.save();
  }

  async setRPEMap(rpeMap: Record<number, number>): Promise<void> {
    this.store.rpeMap = rpeMap;
    await this.save();
  }

  async savePreset(name: string, tool: ToolKey, payload: any): Promise<void> {
    const preset: Preset = {
      id: Date.now().toString(),
      name,
      tool,
      payload,
      createdAt: Date.now(),
    };
    this.store.presets = [preset, ...this.store.presets];
    await this.save();
  }

  async deletePreset(id: string): Promise<void> {
    this.store.presets = this.store.presets.filter(p => p.id !== id);
    await this.save();
  }

  async setLastUsed(tool: ToolKey, data: any): Promise<void> {
    this.store.lastUsed = { ...this.store.lastUsed, [tool]: data };
    await this.save();
  }

  getPresets(): Preset[] {
    return this.store.presets;
  }

  getPresetsByTool(tool: ToolKey): Preset[] {
    return this.store.presets.filter(p => p.tool === tool);
  }
}