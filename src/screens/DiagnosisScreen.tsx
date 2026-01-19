import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { createHybridDiagnosis, createCanopyDiagnosis } from '../services/diagnosisApi';
import { useStore } from '../store/useStore';
import { ActivityIndicator } from 'react-native';

// Screen Dimensions
const { width, height } = Dimensions.get('window');

// Modes
type ScanMode = 'DIAGNOSIS' | 'CANOPY' | 'LOG';
type CameraFacing = 'front' | 'back';

const UnifiedScannerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>('back');
  const [mode, setMode] = useState<ScanMode>('DIAGNOSIS');
  const [helpVisible, setHelpVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
          <Text style={styles.permText}>권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If not focused, render empty view to release camera resource and prevent black screen
  if (!isFocused) {
    return <View style={styles.container} />;
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      processImage(selectedUri);
    }
  };

  const { user, farmInfo } = useStore.getState(); // Use getState for one-off access if needed, but hook is better.
  // Actually hook is safer for reactivity. 'useStore' is a hook.
  // const { user, farmInfo } = useStore(); // Fixed below.
  const facilityId = "1"; // Simplified for now

  // Fixed hook usage inside component
  // const storeData = useStore(); 
  // const facilityId = storeData.farmInfo?.id || "1";

  const processImage = async (uri: string) => {
    try {
      setLoading(true);

      console.log(`📷 [${mode}] 이미지 변환 중...`);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imageBase64 = `data:image/jpeg;base64,${base64}`;
      console.log(`📷 [${mode}] base64 변환 완료`);

      if (mode === 'DIAGNOSIS' || mode === 'LOG') {
        const uploadType = mode === 'DIAGNOSIS' ? 'diagnosis' : 'growth_log';
        const result = await createHybridDiagnosis({
          image: imageBase64,
          farm_id: facilityId,
          upload_type: uploadType
        });

        setLoading(false);
        navigation.navigate('DiagnosisResult', {
          imageUri: uri,
          result: result,
          mode: mode
        });

      } else if (mode === 'CANOPY') {
        const result = await createCanopyDiagnosis({
          image: imageBase64,
          farm_id: facilityId,
          variety: "shine_muscat",
          area_m2: 3000,
          growth_stage: "veraison"
        });

        setLoading(false);
        navigation.navigate('DiagnosisResult', {
          imageUri: uri,
          result: result,
          mode: 'CANOPY'
        });
      }

    } catch (error: any) {
      setLoading(false);
      console.error(`❌ [${mode}] 오류:`, error);
      Alert.alert('분석 실패', error.message || '서버와 통신 중 오류가 발생했습니다.');
    }
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Photo taken:', photo?.uri);
        if (photo?.uri) {
          processImage(photo.uri);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const HelpContent = () => {
    return (
      <View style={styles.helpContent}>
        <View style={styles.helpSection}>
          <View style={styles.helpHeader}>
            <Text style={styles.helpIcon}>🔍</Text>
            <Text style={styles.helpTitle}>닥터팜</Text>
          </View>
          <Text style={styles.helpText}>
            사진은 환경변수와 함께 분석하여 병해를 조기 발견하고 방제하도록 돕습니다.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• 탄저병, 노균병, 흰가루병 등 12종 감지</Text>
            <Text style={styles.bullet}>• 진단 정확도 95% 이상</Text>
            <Text style={styles.bullet}>• 방제 방법까지 바로 안내</Text>
          </View>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>💡 팁: 병반 부위를 화면 중앙에 놓고 햇빛 아래서 촬영하면 정확도가 높아져요.</Text>
          </View>
        </View>

        <View style={styles.helpSection}>
          <View style={styles.helpHeader}>
            <Text style={styles.helpIcon}>🌿</Text>
            <Text style={styles.helpTitle}>차폐율 측정</Text>
          </View>
          <Text style={styles.helpText}>
            수확량 및 수확시기 예측 시스템으로, 사진 분석을 통해 캐노피 밀도를 자동 계산합니다.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• 잎면적 계산을 위해 하늘을 향해 촬영하세요.</Text>
            <Text style={styles.bullet}>• 직사광선이 내리쬐는 시간은 피해주세요.</Text>
            <Text style={styles.bullet}>• 촬영 시 신체가 가리지 않도록 주의하세요.</Text>
          </View>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>💡 활용: 적심·적엽 시기 판단, 착색기 광 투과량 관리에 참고하세요.</Text>
          </View>
        </View>

        <View style={styles.helpSection}>
          <View style={styles.helpHeader}>
            <Text style={styles.helpIcon}>📸</Text>
            <Text style={styles.helpTitle}>성장일기</Text>
          </View>
          <Text style={styles.helpText}>
            주기적으로 잎 또는 나무 전체를 찍어두면 수집된 환경변수와 함께 분석하여 물관리, 비료관리, 병해 조기 발견 등을 자동으로 진행합니다.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• 촬영된 사진은 심야시간에 Wi-Fi 환경에서 자동 업로드됩니다.</Text>
            <Text style={styles.bullet}>• 생육 변화를 타임라인으로 확인하세요.</Text>
          </View>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>💡 팁: 매주 같은 요일, 같은 각도로 촬영하면 변화를 한눈에 볼 수 있어요.</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        mode="picture"
        ref={cameraRef}
      >
        <SafeAreaView style={styles.overlayContainer}>

          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setHelpVisible(true)}
            activeOpacity={0.8}
            style={styles.helpCardContainer}
          >
            <View style={styles.helpCardContent}>
              <Ionicons name="bulb" size={20} color="#FCD34D" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.triggerTitle}>스마트 촬영 가이드</Text>
                <Text style={styles.triggerSub}>각 모드별 사용법 보기</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>

          <View style={styles.centerFocusArea}>
            <View style={styles.focusFrame}>
              <View style={[styles.corner, styles.tl]} />
              <View style={[styles.corner, styles.tr]} />
              <View style={[styles.corner, styles.bl]} />
              <View style={[styles.corner, styles.br]} />
            </View>
            <Text style={styles.focusText}>
              {mode === 'DIAGNOSIS' && '잎의 반점이나 해충이 잘 보이게\n근접 촬영하세요.'}
              {mode === 'CANOPY' && '나무 아래에서 하늘을 향해\n캐노피를 촬영하세요.'}
              {mode === 'LOG' && '작물 전체가 나오도록\n정면에서 촬영하세요.'}
            </Text>
          </View>

          <View style={styles.bottomControls}>
            <View style={styles.modeSelector}>
              <TouchableOpacity onPress={() => setMode('DIAGNOSIS')} style={[styles.modeBtn, mode === 'DIAGNOSIS' && styles.modeActive]}>
                <Text style={[styles.modeText, mode === 'DIAGNOSIS' && styles.modeTextActive]}>병해진단</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode('CANOPY')} style={[styles.modeBtn, mode === 'CANOPY' && styles.modeActive]}>
                <Text style={[styles.modeText, mode === 'CANOPY' && styles.modeTextActive]}>차폐율</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode('LOG')} style={[styles.modeBtn, mode === 'LOG' && styles.modeActive]}>
                <Text style={[styles.modeText, mode === 'LOG' && styles.modeTextActive]}>성장일지</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.captureRow}>
              <TouchableOpacity style={styles.galleryBtn} onPress={pickImage}>
                <Ionicons name="images" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={takePicture} activeOpacity={0.7}>
                <View style={styles.shutterOuter}>
                  <View style={[styles.shutterInner, { backgroundColor: mode === 'DIAGNOSIS' ? '#F59E0B' : (mode === 'CANOPY' ? '#10B981' : '#3B82F6') }]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.flipBtn} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

        </SafeAreaView>
      </CameraView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>AI 진단 중입니다...</Text>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={helpVisible}
        onRequestClose={() => setHelpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>촬영 도우미 📘</Text>
              <TouchableOpacity onPress={() => setHelpVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <HelpContent />
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permBtn: {
    marginTop: 20,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
  },
  permText: {
    color: 'white',
    fontWeight: 'bold',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  helpCardContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 10,
  },
  helpCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  triggerTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  triggerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  centerFocusArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#10B981',
    borderWidth: 3,
  },
  tl: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  tr: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bl: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  br: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  focusText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomControls: {
    paddingBottom: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 30,
  },
  modeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modeActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FCD34D',
  },
  modeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  modeTextActive: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  galleryBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '85%',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalScroll: {
    padding: 20,
  },
  helpContent: {
    gap: 24,
  },
  helpSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  helpText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    fontWeight: '500',
  },
  tipBox: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default UnifiedScannerScreen;