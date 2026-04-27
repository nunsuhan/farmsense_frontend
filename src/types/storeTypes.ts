export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    facilityId?: string;
    createdAt?: string;
    // Backend ProfileUpdateView GET 응답 필드 (commit 0b47912)
    username?: string;
    onboarding_completed?: boolean;
    kakao_report_enabled?: boolean;
}

export interface FarmInfo {
    id: string;
    userId: string;
    name: string;
    region: string;
    address?: string;
    crop?: string;
    area?: number;
    createdAt?: string;
    // Detailed Info
    variety?: string;
    cultivationType?: string;
    plantingYear?: string;
    soilType?: string;
    irrigationType?: string;
    pestHistory?: string;
    // Facility Flags
    hasIrrigation?: boolean;
    hasDrainage?: boolean;
    hasSubsoiling?: boolean;
    hasUV?: boolean;
    hasMat?: boolean;
}

export interface LatLng {
    latitude: number;
    longitude: number;
}

export interface FarmSector {
    id: string;
    farmId?: string;
    name: string;
    coordinates: LatLng[];
    area: number;           // m²
    crop?: string;
    type: 'outdoor' | 'greenhouse';
    color?: string;
    sensorIds?: string[];
    createdAt?: string;
}

export interface SensorValue {
    value: number;
    unit: string;
    timestamp: string;      // ISO 8601
    status: 'normal' | 'warning' | 'error';
}

export interface SensorData {
    temperature: SensorValue | null;
    humidity: SensorValue | null;
    soil_moisture: SensorValue | null;
    co2: SensorValue | null;
    light?: SensorValue | null;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: string;
    read: boolean;
}
