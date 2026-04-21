/**
 * ReceiptOCRScreen - 영수증 사진으로 영농일지 자동 기입
 * 카메라 촬영 또는 갤러리 선택 → POST /api/fieldbook/receipt-ocr/ → 파싱 결과 확인 → 일지 저장
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors } from '../../theme/colors';
import { ocrReceipt, ReceiptOCRResult } from '../../services/smartLensApi';

const ReceiptOCRScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReceiptOCRResult | null>(null);

  const compress = async (uri: string) => {
    try {
      const out = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1600 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return out.uri;
    } catch {
      return uri;
    }
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
      return;
    }
    const r = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!r.canceled && r.assets[0]?.uri) {
      const compressed = await compress(r.assets[0].uri);
      setImageUri(compressed);
      setResult(null);
    }
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!r.canceled && r.assets[0]?.uri) {
      const compressed = await compress(r.assets[0].uri);
      setImageUri(compressed);
      setResult(null);
    }
  };

  const runOCR = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const res = await ocrReceipt(imageUri);
      setResult(res);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        'OCR 처리 실패';
      Alert.alert('오류', msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageUri(null);
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>영수증 자동 기입</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {!imageUri && (
          <View style={styles.pickerBox}>
            <Ionicons name="receipt-outline" size={72} color={colors.textDisabled} />
            <Text style={styles.pickerTitle}>영수증 사진을 추가하세요</Text>
            <Text style={styles.pickerHint}>
              AI가 품목, 금액, 날짜를 자동으로 추출하여{'\n'}영농일지에 기록합니다
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={pickFromCamera}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>카메라 촬영</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, styles.secondaryBtn]} onPress={pickFromLibrary}>
              <Ionicons name="images-outline" size={20} color={colors.primary} />
              <Text style={[styles.primaryBtnText, { color: colors.primary }]}>갤러리에서 선택</Text>
            </TouchableOpacity>
          </View>
        )}

        {imageUri && (
          <View style={styles.previewBox}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
            {!result && (
              <>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={runOCR}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="scan" size={20} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>분석 시작</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, styles.secondaryBtn]}
                  onPress={reset}
                  disabled={loading}
                >
                  <Text style={[styles.primaryBtnText, { color: colors.primary }]}>
                    다른 사진 선택
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>분석 결과</Text>
            {result.shop_name && <Row label="상점" value={result.shop_name} />}
            {result.date && <Row label="날짜" value={result.date} />}
            {result.total_amount !== undefined && (
              <Row label="총액" value={`${result.total_amount.toLocaleString()}원`} />
            )}
            {result.items && result.items.length > 0 && (
              <>
                <Text style={styles.subTitle}>품목 ({result.items.length})</Text>
                {result.items.map((it, i) => (
                  <View key={i} style={styles.itemRow}>
                    <Text style={styles.itemName}>{it.name}</Text>
                    <Text style={styles.itemMeta}>
                      {[it.quantity, it.price ? `${it.price.toLocaleString()}원` : undefined]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                ))}
              </>
            )}
            {result.error && (
              <Text style={styles.errorText}>{result.error}</Text>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 20 }]}
              onPress={() => {
                navigation.navigate('LogWrite', { receiptOCR: result });
              }}
            >
              <Text style={styles.primaryBtnText}>영농일지에 저장</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, styles.secondaryBtn]}
              onPress={reset}
            >
              <Text style={[styles.primaryBtnText, { color: colors.primary }]}>
                다시 분석
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { padding: 20 },
  pickerBox: { alignItems: 'center', paddingTop: 40 },
  pickerTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 16 },
  pickerHint: { fontSize: 14, color: colors.textSub, textAlign: 'center', marginTop: 8, lineHeight: 22, marginBottom: 32 },
  previewBox: { alignItems: 'center' },
  previewImage: { width: '100%', height: 320, backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 16 },
  resultBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginTop: 16 },
  resultTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  subTitle: { fontSize: 14, fontWeight: '700', color: colors.textSub, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowLabel: { fontSize: 14, color: colors.textSub },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  itemRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemName: { fontSize: 14, color: colors.text, fontWeight: '600' },
  itemMeta: { fontSize: 12, color: colors.textSub, marginTop: 2 },
  errorText: { fontSize: 14, color: '#B91C1C', marginTop: 12 },
  primaryBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  secondaryBtn: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: colors.primary },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

export default ReceiptOCRScreen;
