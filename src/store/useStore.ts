/**
 * Zustand Store for Global State Management
 * FarmSense 프론트엔드 전역 상태 관리
 * 
 * BACKEND_HANDOFF.md 명세에 따라 구현됨
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSectors } from '../services/sectorApi';

import {
  User,
  FarmInfo,
  FarmSector,
  SensorData,
  Notification
} from '../types/storeTypes';

// ============================================
// Store State Interface
// ============================================

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => Promise<void>;

  // Avatar
  avatarId: string;
  setAvatarId: (id: string) => Promise<void>;

  // Farm Info
  farmInfo: FarmInfo | null;
  setFarmInfo: (info: FarmInfo | null) => Promise<void>;

  // Sensor Data (실시간)
  sensorData: SensorData | null;
  setSensorData: (data: SensorData | null) => void;

  // Sectors
  sectors: FarmSector[];
  setSectors: (sectors: FarmSector[]) => void;
  addSector: (sector: FarmSector) => void;
  updateSector: (id: string, updates: Partial<FarmSector>) => void;
  removeSector: (id: string) => void;
  fetchSectors: (farmId: string) => Promise<void>;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Loading & Error
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Initialization
  isInitialized: boolean;
  setInitialized: (initialized: boolean) => void;

  // Onboarding
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => Promise<void>;
}

// ============================================
// Storage Keys
// ============================================

const STORAGE_KEYS = {
  USER: '@farmsense_user',
  AVATAR_ID: '@farmsense_avatar_id',
  FARM_INFO: '@farmsense_farm_info',
  SECTORS: '@farmsense_sectors',
  NOTIFICATIONS: '@farmsense_notifications',
  ONBOARDING: '@farmsense_onboarding',
} as const;

// ============================================
// Zustand Store
// ============================================

export const useStore = create<AppState>((set, get) => ({
  // User
  user: null,
  setUser: async (user) => {
    set({ user });
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // Avatar
  avatarId: '1',
  setAvatarId: async (id) => {
    set({ avatarId: id });
    await AsyncStorage.setItem(STORAGE_KEYS.AVATAR_ID, id);
  },

  // Farm Info
  farmInfo: null,
  setFarmInfo: async (info) => {
    set({ farmInfo: info });
    if (info) {
      await AsyncStorage.setItem(STORAGE_KEYS.FARM_INFO, JSON.stringify(info));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.FARM_INFO);
    }
  },

  // Sensor Data (실시간 - 메모리에만 저장)
  // Dummy 데이터로 초기화 (즉시 표시용)
  sensorData: {
    temperature: { value: 24, unit: '°C', status: 'normal', timestamp: new Date().toISOString() },
    humidity: { value: 65, unit: '%', status: 'normal', timestamp: new Date().toISOString() },
    soil_moisture: { value: 45, unit: '%', status: 'normal', timestamp: new Date().toISOString() },
    co2: { value: 800, unit: 'ppm', status: 'normal', timestamp: new Date().toISOString() },
  },
  setSensorData: (data) => {
    set({ sensorData: data });
  },

  // Sectors
  sectors: [],
  setSectors: (sectors) => {
    set({ sectors });
    AsyncStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(sectors));
  },
  addSector: (sector) => {
    const newSectors = [...get().sectors, sector];
    set({ sectors: newSectors });
    AsyncStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(newSectors));
  },
  updateSector: (id, updates) => {
    const newSectors = get().sectors.map(s =>
      s.id === id ? { ...s, ...updates } : s
    );
    set({ sectors: newSectors });
    AsyncStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(newSectors));
  },
  removeSector: (id) => {
    const newSectors = get().sectors.filter(s => s.id !== id);
    set({ sectors: newSectors });
    AsyncStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(newSectors));
  },
  fetchSectors: async (farmId) => {
    // ✅ farmId 유효성 검사
    if (!farmId || farmId === '' || farmId === 'undefined') {
      console.warn('⚠️ [useStore] fetchSectors called with invalid farmId:', farmId);
      set({ sectors: [] });
      return;
    }

    try {
      console.log('🔄 [useStore] Fetching sectors for farm:', farmId);
      const sectors = await getSectors(farmId);
      // Cast to FarmSector[] if needed, assuming API returns compatible objects
      set({ sectors: sectors as FarmSector[] });
      await AsyncStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(sectors));
      console.log('✅ [useStore] Sectors fetched:', sectors.length);
    } catch (error: any) {
      console.error('❌ [useStore] fetchSectors failed:', error.message);
      // 에러 발생 시 빈 배열로 설정
      set({ sectors: [] });
    }
  },

  // Notifications
  notifications: [],
  addNotification: (notification) => {
    const newNotifications = [notification, ...get().notifications];
    set({ notifications: newNotifications });
    AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifications));
  },
  markNotificationAsRead: (id) => {
    const newNotifications = get().notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    set({ notifications: newNotifications });
    AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifications));
  },
  clearNotifications: () => {
    set({ notifications: [] });
    AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  },

  // Loading & Error
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),

  // Initialization
  isInitialized: false,
  setInitialized: (initialized) => set({ isInitialized: initialized }),

  // Onboarding
  hasSeenOnboarding: false,
  setHasSeenOnboarding: async (seen) => {
    set({ hasSeenOnboarding: seen });
    if (seen) {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
    }
  },
}));

// ============================================
// Store Initialization
// ============================================

export const initializeStore = async () => {
  try {
    // Load user
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (userJson) {
      const user: User = JSON.parse(userJson);
      useStore.setState({ user });
    }

    // Load avatar
    const avatarId = await AsyncStorage.getItem(STORAGE_KEYS.AVATAR_ID);
    if (avatarId) {
      useStore.setState({ avatarId });
    }

    // Load farm info
    const farmInfoJson = await AsyncStorage.getItem(STORAGE_KEYS.FARM_INFO);
    if (farmInfoJson) {
      const farmInfo: FarmInfo = JSON.parse(farmInfoJson);
      useStore.setState({ farmInfo });
    } else {
      // 기본 농장 정보 설정 (테스트용)
      const defaultFarmInfo: FarmInfo = {
        id: 'farm-123',
        userId: 'user-123',
        name: '테스트 농장',
        region: '서울',
        crop: '포도',
      };
      useStore.setState({ farmInfo: defaultFarmInfo });
      await AsyncStorage.setItem(STORAGE_KEYS.FARM_INFO, JSON.stringify(defaultFarmInfo));
    }

    // Load sectors
    const sectorsJson = await AsyncStorage.getItem(STORAGE_KEYS.SECTORS);
    if (sectorsJson) {
      const sectors: FarmSector[] = JSON.parse(sectorsJson);
      useStore.setState({ sectors });
    }

    // Load notifications
    const notificationsJson = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (notificationsJson) {
      const notifications: Notification[] = JSON.parse(notificationsJson);
      useStore.setState({ notifications });
    }

    // Load onboarding status
    const onboarding = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
    if (onboarding === 'true') {
      useStore.setState({ hasSeenOnboarding: true });
    }

    console.log('✅ Store initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize store:', error);
  } finally {
    useStore.setState({ isInitialized: true });
  }
};

// ============================================
// Selector Hooks (Optional - for better performance)
// ============================================

export const useUser = () => useStore((state) => state.user);
export const useSetUser = () => useStore((state) => state.setUser);
export const useFarmInfo = () => useStore((state) => state.farmInfo);
export const useSensorData = () => useStore((state) => state.sensorData);
export const useSectors = () => useStore((state) => state.sectors);
export const useNotifications = () => useStore((state) => state.notifications);
export const useAvatarId = () => useStore((state) => state.avatarId);
export const useSetAvatarId = () => useStore((state) => state.setAvatarId);

// ✅ New Selector for Farm ID (Standardized)
export const useFarmId = () => useStore((state) => state.farmInfo?.id);

export default useStore;
