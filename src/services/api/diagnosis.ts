import axios from 'axios';
import { Platform } from 'react-native';
import apiClient from '../api';

// API_BASE_URL은 API_CONFIG.BASE_URL 사용 (아래 import 참조)

export interface DiagnosisResult {
    disease_name: string;
    confidence: number;
    recommendation: string;
    image_url?: string;
}

import * as FileSystem from 'expo-file-system';
import { API_CONFIG } from '../../constants/config'; // Make sure to import config
import { HybridDiagnosisResponse } from '../../types/api.types';

export const diagnoseDisease = async (imageUri: string): Promise<HybridDiagnosisResponse> => {
    try {
        // 1. Convert File URI to Base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // 2. Prepare JSON Payload
        const payload = {
            image: base64,
            include_prescription: true,
        };

        // 3. Call Hybrid API
        // Use API_CONFIG.ENDPOINTS.DIAGNOSIS.HYBRID which corresponds to '/v1/diagnosis/hybrid/'
        const response = await apiClient.post<HybridDiagnosisResponse>(
            '/v1/diagnosis/hybrid/', // Hardcoded for safety or import form config
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Skip-Global-Error': 'true',
                },
                timeout: 60000, // Increased timeout for RAG
            }
        );

        return response.data;
    } catch (error) {
        console.error('Hybrid Diagnosis API Error:', error);
        throw error;
    }
};
