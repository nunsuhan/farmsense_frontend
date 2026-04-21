/**
 * BarcodeScannerScreen - 농약 바코드 스캔
 * 카메라로 1D/2D 바코드 인식 → POST /api/pesticide/scan/ → 농약 정보 + PLS 결과
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '../../theme/colors';
import { useStore } from '../../store/useStore';
import { scanBarcode, BarcodeScanResult } from '../../services/smartLensApi';

const BarcodeScannerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BarcodeScanResult | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const scanLock = useRef(false);

  const farmInfo = useStore((s) => s.farmInfo);
  const farmId = (farmInfo?.id as number | undefined) || undefined;

  const handleScanned = async ({ data }: { type: string; data: string }) => {
    if (scanLock.current || loading) return;
    scanLock.current = true;
    setScannedCode(data);
    setLoading(true);
    try {
      const res = await scanBarcode(data, { farm_id: farmId, crop: 'grape' });
      setResult(res);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        '바코드 조회 실패';
      setResult({ error: msg });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setScannedCode(null);
    scanLock.current = false;
  };

  if (!permission) {
    return <View style={styles.container} />;
  }
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.permissionBox}>
          <Ionicons name="camera-outline" size={48} color={colors.textSub} />
          <Text style={styles.permissionText}>카메라 권한이 필요합니다</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>권한 허용</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (result) {
    const hasError = !!result.error;
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>스캔 결과</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.resultScroll} contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.barcodeLabel}>바코드</Text>
          <Text style={styles.barcodeValue}>{scannedCode}</Text>

          {hasError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{result.error}</Text>
            </View>
          ) : (
            <>
              <InfoRow label="제품명" value={result.name} />
              <InfoRow label="제조사" value={result.manufacturer} />
              <InfoRow label="유효 성분" value={result.active_ingredient} />
              {result.pls && (
                <View style={styles.plsBox}>
                  <Text style={styles.plsTitle}>
                    PLS 체크: {result.pls.status}
                  </Text>
                  {result.pls.mrl !== undefined && (
                    <Text style={styles.plsBody}>
                      MRL: {result.pls.mrl} {result.pls.unit || ''}
                    </Text>
                  )}
                  {result.pls.message && (
                    <Text style={styles.plsBody}>{result.pls.message}</Text>
                  )}
                </View>
              )}
              {result.duplicate_check?.has_duplicate && (
                <View style={styles.warnBox}>
                  <Ionicons name="warning-outline" size={18} color="#F59E0B" />
                  <Text style={styles.warnText}>
                    최근 {result.duplicate_check.recent_history_days}일 내 동일 성분 사용 이력 있음
                    (심각도: {result.duplicate_check.severity})
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={{ height: 16 }} />
          <TouchableOpacity style={styles.primaryBtn} onPress={reset}>
            <Text style={styles.primaryBtnText}>다시 스캔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, styles.secondaryBtn]}
            onPress={() => {
              navigation.navigate('PesticideRecord', {
                prefill: result,
                barcode: scannedCode,
              });
            }}
            disabled={hasError}
          >
            <Text style={[styles.primaryBtnText, hasError && { color: '#999' }]}>
              영농일지(농약)에 기록
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>농약 바코드 스캔</Text>
        <View style={{ width: 24 }} />
      </View>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code128', 'qr', 'itf14',
          ],
        }}
        onBarcodeScanned={loading ? undefined : handleScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanHint}>
            농약 용기의 바코드를 사각 영역에 맞춰주세요
          </Text>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>조회 중...</Text>
            </View>
          )}
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  ) : null;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanFrame: {
    width: 260,
    height: 160,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanHint: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  loadingText: { color: '#FFFFFF', fontSize: 15, marginTop: 12 },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  permissionText: { fontSize: 16, color: colors.text, marginTop: 16 },
  permissionBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permissionBtnText: { color: '#FFFFFF', fontWeight: '700' },
  resultScroll: { flex: 1, backgroundColor: '#F9FAFB' },
  barcodeLabel: { fontSize: 13, color: colors.textSub },
  barcodeValue: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4, marginBottom: 20 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: { fontSize: 14, color: colors.textSub },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1, textAlign: 'right' },
  plsBox: {
    marginTop: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
  },
  plsTitle: { fontSize: 15, fontWeight: '700', color: '#1D4ED8' },
  plsBody: { fontSize: 13, color: colors.textSub, marginTop: 4 },
  warnBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  warnText: { flex: 1, fontSize: 13, color: '#92400E' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
  },
  errorText: { flex: 1, fontSize: 14, color: '#B91C1C' },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryBtn: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: colors.primary },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

export default BarcodeScannerScreen;
