/**
 * FieldBook API — 성장일지 엔트리 생성 (자동 분석 파이프라인 포함)
 *
 * 서버: POST /api/fieldbook/entries/  (IsAuthenticated, multipart/form-data)
 *
 * 업로드한 사진마다 서버가 Stage 0~4 파이프라인을 돌려 analysis_result를 반환.
 */
import apiClient from './api';

export interface FieldBookEntryCreateParams {
  intervention_type?: string; // 'photo' | 'spray' | 'irrigation' | ...
  intervention_date?: string; // 'YYYY-MM-DD'
  details?: Record<string, any>;
  notes?: string;
  farm_id?: number;
  photos?: string[]; // local URI 리스트 (expo-image-picker 결과)
}

export interface ImageAnalysisResult {
  photo_id: number;
  gdd_bbch: number | null;
  gdd_bbch_korean: string;
  gdd_value: number | null;
  vision_bbch: number | null;
  vision_image_type: string;
  stage_mismatch: boolean;
  disease_local: string;
  disease_confidence: number | null;
  severity: string;
  traits_json: Record<string, any>;
  cei_at_capture: number | null;
  vision_used: boolean;
  vision_trigger: string;
  validation_flags: string[];
  warnings: string[];
  error?: string;
}

export interface FieldBookEntryResponse {
  id: number;
  intervention_type: string;
  intervention_date: string;
  notes: string;
  photos: Array<{ id: number; image_url: string | null }>;
  analysis_results: ImageAnalysisResult[];
}

export const createFieldBookEntry = async (
  params: FieldBookEntryCreateParams
): Promise<FieldBookEntryResponse> => {
  const form = new FormData();
  form.append('intervention_type', params.intervention_type || 'photo');
  form.append(
    'intervention_date',
    params.intervention_date || new Date().toISOString().slice(0, 10)
  );
  form.append('details', JSON.stringify(params.details || {}));
  form.append('notes', params.notes || '');
  if (params.farm_id) form.append('farm_id', String(params.farm_id));

  (params.photos || []).forEach((uri, idx) => {
    const filename = uri.split('/').pop() || `photo_${idx}.jpg`;
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    form.append('photos', {
      uri,
      name: filename,
      type: mime,
    } as any);
  });

  const res = await apiClient.post<FieldBookEntryResponse>('/fieldbook/entries/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // Vision 호출 시 시간 소요
  });
  return res.data;
};

export default { createFieldBookEntry };
