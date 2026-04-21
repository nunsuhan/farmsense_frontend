/**
 * Smart Lens API - 농약 바코드 스캔 + 영수증 OCR
 */
import apiClient from './api';

// ───────────────────────── 바코드 스캔
export interface BarcodeScanResult {
  name?: string;
  manufacturer?: string;
  active_ingredient?: string;
  pls?: { status: string; mrl?: number; unit?: string; message?: string };
  duplicate_check?: {
    has_duplicate: boolean;
    severity: string;
    details: any[];
    recent_history_count: number;
    recent_history_days: number;
  };
  alternatives?: any[];
  error?: string;
}

export const scanBarcode = async (
  barcode: string,
  opts?: { farm_id?: number; crop?: string }
): Promise<BarcodeScanResult> => {
  const res = await apiClient.post('/pesticide/scan/', {
    barcode,
    farm_id: opts?.farm_id,
    crop: opts?.crop || 'grape',
  });
  return res.data;
};

// ───────────────────────── 영수증 OCR
export interface ReceiptOCRItem {
  name: string;
  quantity?: string;
  price?: number;
}

export interface ReceiptOCRResult {
  shop_name?: string;
  date?: string;
  items?: ReceiptOCRItem[];
  total_amount?: number;
  raw_text?: string;
  error?: string;
}

export const ocrReceipt = async (imageUri: string): Promise<ReceiptOCRResult> => {
  const form = new FormData();
  const filename = imageUri.split('/').pop() || 'receipt.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  // React Native FormData file 형식
  form.append('image', {
    uri: imageUri,
    name: filename,
    type: mime,
  } as any);

  const res = await apiClient.post('/fieldbook/receipt-ocr/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // OCR은 시간 걸림
  });
  return res.data;
};

export default { scanBarcode, ocrReceipt };
