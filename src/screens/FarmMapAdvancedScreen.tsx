// FarmMapAdvancedScreen - 농장 지도 (고급 기능) - Pure RN Refactor
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/common/ScreenWrapper';
import MapView, { Marker, Circle, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { farmmapApi } from '../services/farmmapApi';
import { Field, MyFarm } from '../types/api.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_MY_FARM = '@my_farm';

interface LocationState {
  coords: {
    latitude: number;
    longitude: number;
  };
}

const FarmMapAdvancedScreen: React.FC = () => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [myFarm, setMyFarm] = useState<MyFarm | null>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(1000); // 1km
  const [fieldTypeFilter, setFieldTypeFilter] = useState<'논' | '밭' | '과수' | null>('과수');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [farmName, setFarmName] = useState('');
  const mapRef = useRef<MapView>(null);

  // 초기 위치 (김천시)
  const DEFAULT_LOCATION = {
    latitude: 36.1399,
    longitude: 128.1139,
  };

  // 초기화
  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      // 내 농장 정보 로드
      await loadMyFarm();

      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';

      if (!hasPermission) {
        console.log('⚠️ [FarmMap] 위치 권한 거부됨');
        Alert.alert(
          '위치 권한 필요',
          '주변 농지를 검색하려면 위치 권한이 필요합니다.\n기본 위치(김천시)로 설정됩니다.'
        );
        await searchNearbyFields(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
        setIsLoading(false);
        return;
      }

      // 현재 위치 가져오기
      console.log('📍 [FarmMap] 현재 위치 가져오는 중...');

      try {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const currentLocation = {
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
        };
        setLocation(currentLocation);
        console.log('✅ [FarmMap] 현재 위치:', currentLocation.coords);

        // 주변 농지 검색
        await searchNearbyFields(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
        setIsLoading(false);
      } catch (error) {
        console.error('❌ [FarmMap] 위치 가져오기 실패:', error);
        Alert.alert('오류', '위치를 가져올 수 없습니다. GPS 설정을 확인해주세요.');
        await searchNearbyFields(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
        setIsLoading(false);
      }

    } catch (error) {
      console.error('❌ [FarmMap] 초기화 실패:', error);
      Alert.alert('오류', '초기화 중 문제가 발생했습니다.');
      await searchNearbyFields(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
      setIsLoading(false);
    }
  };

  // 내 농장 정보 로드
  const loadMyFarm = async () => {
    try {
      const savedFarm = await AsyncStorage.getItem(STORAGE_KEY_MY_FARM);
      if (savedFarm) {
        setMyFarm(JSON.parse(savedFarm));
        console.log('✅ [FarmMap] 내 농장 로드 완료');
      }
    } catch (error) {
      console.error('❌ [FarmMap] 내 농장 로드 실패:', error);
    }
  };

  // 내 농장 저장
  const saveMyFarm = async (farm: MyFarm) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_MY_FARM, JSON.stringify(farm));
      setMyFarm(farm);
      console.log('✅ [FarmMap] 내 농장 저장 완료');
      Alert.alert('성공', '내 농장이 등록되었습니다!');
    } catch (error) {
      console.error('❌ [FarmMap] 내 농장 저장 실패:', error);
      Alert.alert('오류', '농장 등록에 실패했습니다.');
    }
  };

  // 주변 농지 검색 (반경 기반) - 오류 팝업 최소화
  const searchNearbyFields = async (lat: number, lon: number, showError: boolean = false) => {
    try {
      console.log('🔍 [FarmMap] 주변 농지 검색 중...');
      const response = await farmmapApi.searchRadius({
        lat,
        lon,
        radius: searchRadius,
        field_type: fieldTypeFilter || undefined,
      });

      setFields(response.fields || []);
      console.log('✅ [FarmMap] 농지 검색 완료:', response.count || 0, '개');
    } catch (error) {
      console.error('❌ [FarmMap] 농지 검색 실패:', error);
      setFields([]); // 빈 배열로 설정
      // 오류 팝업은 사용자가 명시적으로 요청했을 때만 표시
      if (showError) {
        Alert.alert('알림', '주변 농지 데이터를 불러올 수 없습니다.\n잠시 후 다시 시도해주세요.');
      }
    }
  };

  // 내 위치로 이동
  const handleGoToMyLocation = () => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    } else {
      Alert.alert('알림', '현재 위치를 가져올 수 없습니다.');
    }
  };

  // 내 농장으로 이동
  const handleGoToMyFarm = () => {
    if (myFarm && myFarm.field.center) {
      mapRef.current?.animateToRegion({
        latitude: myFarm.field.center.latitude,
        longitude: myFarm.field.center.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } else {
      Alert.alert('알림', '등록된 농장이 없습니다.');
    }
  };

  // 반경 변경
  const handleChangeRadius = async (newRadius: number) => {
    setSearchRadius(newRadius);
    const lat = location?.coords.latitude || DEFAULT_LOCATION.latitude;
    const lon = location?.coords.longitude || DEFAULT_LOCATION.longitude;
    await searchNearbyFields(lat, lon);
  };

  // 농경지 타입 변경
  const handleChangeFieldType = async (newType: '논' | '밭' | '과수' | null) => {
    setFieldTypeFilter(newType);
    const lat = location?.coords.latitude || DEFAULT_LOCATION.latitude;
    const lon = location?.coords.longitude || DEFAULT_LOCATION.longitude;
    await searchNearbyFields(lat, lon);
  };

  // 필지 클릭
  const handleFieldPress = (field: Field) => {
    setSelectedField(field);
  };

  // 지도 클릭 - 선택 해제만 수행 (자동 검색 제거)
  const handleMapPress = (event: any) => {
    // 필지 선택 해제
    setSelectedField(null);
    console.log('📍 [FarmMap] 지도 클릭 - 선택 해제');
  };

  // 특정 위치의 농지 검색 (버튼으로 호출)
  const searchFieldAtLocation = async (lat: number, lon: number) => {
    try {
      console.log('🔍 [FarmMap] 위치 기반 농지 검색:', lat, lon);
      const response = await farmmapApi.searchByLocation({
        lat: lat,
        lon: lon,
      });

      if (response.fields && response.fields.length > 0) {
        const field = response.fields[0];
        setSelectedField(field);
        Alert.alert(
          '농지 정보',
          `${field.fl_nm} (${field.fl_ar}㎡)\n${field.address}\n\n내 농장으로 등록하시겠습니까?`,
          [
            { text: '취소', style: 'cancel' },
            { text: '등록', onPress: () => openRegisterModal(field) },
          ]
        );
      } else {
        Alert.alert('알림', '해당 위치에 농지 정보가 없습니다.');
      }
    } catch (error) {
      console.error('❌ [FarmMap] 농지 검색 실패:', error);
      // 오류 팝업은 한 번만 표시
    }
  };

  // 농장 등록 모달 열기
  const openRegisterModal = (field: Field) => {
    setSelectedField(field);
    setShowRegisterModal(true);
  };

  // 농장 등록
  const handleRegisterFarm = async () => {
    if (!selectedField) return;
    if (!farmName.trim()) {
      Alert.alert('알림', '농장 이름을 입력해주세요.');
      return;
    }

    const newFarm: MyFarm = {
      pnu: selectedField.pnu,
      name: farmName.trim(),
      field: selectedField,
      created_at: new Date(),
    };

    await saveMyFarm(newFarm);
    setShowRegisterModal(false);
    setFarmName('');
  };

  // 상세 모달 닫기
  const closeDetailModal = () => {
    setSelectedField(null);
  };

  // 농경지 타입에 따른 색상
  const getFieldColor = (fieldType: string) => {
    switch (fieldType) {
      case '논':
        return 'rgba(59, 130, 246, 0.3)'; // 파란색
      case '밭':
        return 'rgba(251, 146, 60, 0.3)'; // 주황색
      case '과수':
        return 'rgba(16, 185, 129, 0.3)'; // 초록색
      default:
        return 'rgba(156, 163, 175, 0.3)'; // 회색
    }
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <ScreenWrapper title="인공위성 지도">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>지도를 불러오는 중...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const centerLocation = location
    ? {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }
    : DEFAULT_LOCATION;

  console.log('🗺️ [FarmMapAdvanced] 렌더링:', {
    centerLocation,
    fieldsCount: fields.length,
    hasMyFarm: !!myFarm,
    isLoading,
  });

  return (
    <ScreenWrapper title="인공위성 지도">
      {/* 지도 */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...centerLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={handleMapPress}
        onMapReady={() => console.log('✅ [FarmMapAdvanced] 지도 로딩 완료')}
      >
        {/* 검색 반경 표시 */}
        <Circle
          center={centerLocation}
          radius={searchRadius}
          fillColor="rgba(16, 185, 129, 0.05)"
          strokeColor="rgba(16, 185, 129, 0.3)"
          strokeWidth={1}
        />

        {/* 내 농장 폴리곤 */}
        {myFarm && myFarm.field.coordinates && (
          <Polygon
            coordinates={myFarm.field.coordinates.map(coord => ({
              latitude: coord[0],
              longitude: coord[1],
            }))}
            fillColor="rgba(239, 68, 68, 0.3)"
            strokeColor="rgba(239, 68, 68, 0.8)"
            strokeWidth={3}
          />
        )}

        {/* 내 농장 마커 */}
        {myFarm && myFarm.field.center && (
          <Marker
            coordinate={{
              latitude: myFarm.field.center.latitude,
              longitude: myFarm.field.center.longitude,
            }}
            title={myFarm.name}
            description={`${myFarm.field.fl_ar}㎡`}
          >
            <View style={[styles.markerContainer, { borderColor: '#EF4444' }]}>
              <Text style={styles.markerIcon}>🏡</Text>
            </View>
          </Marker>
        )}

        {/* 주변 농지 폴리곤들 */}
        {(fields || []).map((field) => (
          field?.coordinates && field.coordinates.length > 0 ? (
            <React.Fragment key={field.pnu}>
              <Polygon
                coordinates={field.coordinates.map(coord => ({
                  latitude: coord[0] || 0,
                  longitude: coord[1] || 0,
                }))}
                fillColor={getFieldColor(field.fl_nm || '')}
                strokeColor={getFieldColor(field.fl_nm || '').replace('0.3', '0.8')}
                strokeWidth={2}
                tappable={true}
                onPress={() => handleFieldPress(field)}
              />
              {field.center && (
                <Marker
                  coordinate={{
                    latitude: field.center.latitude,
                    longitude: field.center.longitude,
                  }}
                  title={field.fl_nm}
                  description={`${field.fl_ar}㎡`}
                  onPress={() => handleFieldPress(field)}
                >
                  <View style={styles.smallMarker}>
                    <Text style={styles.smallMarkerText}>
                      {field.fl_nm === '논' ? '🌾' : field.fl_nm === '밭' ? '🌽' : '🍇'}
                    </Text>
                  </View>
                </Marker>
              )}
            </React.Fragment>
          ) : null
        ))}
      </MapView>

      {/* 상단 정보 */}
      <View style={styles.topInfo}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            🗺️ 농지 <Text style={styles.infoCount}>{(fields || []).length}개</Text>
          </Text>
          <Text style={styles.infoSubtext}>반경 {(searchRadius / 1000).toFixed(1)}km</Text>
          {myFarm && (
            <Text style={styles.myFarmText}>🏡 내 농장: {myFarm.name}</Text>
          )}
          <Text style={styles.sourceText}>출처: 농림축산식품부</Text>
        </View>
      </View>

      {/* 하단 컨트롤 */}
      <View style={styles.bottomControls}>
        {/* 버튼들 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleGoToMyLocation}
          >
            <Text style={styles.controlButtonIcon}>📍</Text>
          </TouchableOpacity>

          {myFarm && (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: '#EF4444' }]}
              onPress={handleGoToMyFarm}
            >
              <Text style={styles.controlButtonIcon}>🏡</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 농경지 타입 선택 */}
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>농경지 분류</Text>
          <View style={styles.filterButtons}>
            {[null, '논', '밭', '과수'].map((type) => (
              <TouchableOpacity
                key={type || 'all'}
                style={[
                  styles.filterButton,
                  fieldTypeFilter === type && styles.filterButtonActive,
                ]}
                onPress={() => handleChangeFieldType(type as any)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    fieldTypeFilter === type && styles.filterButtonTextActive,
                  ]}
                >
                  {type || '전체'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 반경 선택 */}
        <View style={styles.radiusCard}>
          <Text style={styles.radiusLabel}>검색 반경</Text>
          <View style={styles.radiusButtons}>
            {[500, 1000, 2000].map((radius) => (
              <TouchableOpacity
                key={radius}
                style={[
                  styles.radiusButton,
                  searchRadius === radius && styles.radiusButtonActive,
                ]}
                onPress={() => handleChangeRadius(radius)}
              >
                <Text
                  style={[
                    styles.radiusButtonText,
                    searchRadius === radius && styles.radiusButtonTextActive,
                  ]}
                >
                  {radius / 1000}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* 농지 상세 모달 */}
      <Modal
        visible={selectedField !== null && !showRegisterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedField && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedField.fl_nm} 정보</Text>
                  <TouchableOpacity onPress={closeDetailModal}>
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📏 면적</Text>
                    <Text style={styles.detailValue}>{(selectedField.fl_ar ?? 0).toLocaleString()}㎡</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🏷️ 분류</Text>
                    <Text style={styles.detailValue}>{selectedField.fl_nm}</Text>
                  </View>

                  {selectedField.crop && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>🌱 작물</Text>
                      <Text style={styles.detailValue}>{selectedField.crop}</Text>
                    </View>
                  )}

                  {selectedField.variety && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>🍇 품종</Text>
                      <Text style={styles.detailValue}>{selectedField.variety}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 주소</Text>
                    <Text style={styles.detailValue}>{selectedField.address}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🔢 PNU</Text>
                    <Text style={[styles.detailValue, { fontSize: 12 }]}>{selectedField.pnu}</Text>
                  </View>

                  {selectedField.distance && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>📏 거리</Text>
                      <Text style={styles.detailValue}>{selectedField.distance}m</Text>
                    </View>
                  )}

                  {/* 토양 정보 */}
                  {selectedField.soil && (
                    <>
                      <View style={styles.sectionDivider} />
                      <Text style={styles.sectionTitle}>🌱 토양 정보</Text>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>토성</Text>
                        <Text style={styles.detailValue}>{selectedField.soil.type}</Text>
                      </View>

                      {selectedField.soil.ph && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>pH</Text>
                          <Text style={styles.detailValue}>
                            {selectedField.soil.ph}
                            {selectedField.soil.ph >= 6.0 && selectedField.soil.ph <= 7.0 && ' (적정)'}
                          </Text>
                        </View>
                      )}

                      {selectedField.soil.organic_matter && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>유기물</Text>
                          <Text style={styles.detailValue}>
                            {selectedField.soil.organic_matter}%
                            {selectedField.soil.organic_matter >= 2 && selectedField.soil.organic_matter <= 3 && ' (보통)'}
                          </Text>
                        </View>
                      )}

                      {selectedField.soil.drainage && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>배수</Text>
                          <Text style={styles.detailValue}>{selectedField.soil.drainage}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* 지형 정보 */}
                  {selectedField.terrain && (
                    <>
                      <View style={styles.sectionDivider} />
                      <Text style={styles.sectionTitle}>📐 지형 정보</Text>

                      {selectedField.terrain.slope_degree !== undefined && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>경사도</Text>
                          <Text style={styles.detailValue}>
                            {selectedField.terrain.slope_degree}° ({selectedField.terrain.slope_category})
                          </Text>
                        </View>
                      )}

                      {selectedField.terrain.aspect && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>방향</Text>
                          <Text style={styles.detailValue}>
                            {selectedField.terrain.aspect}
                            {selectedField.terrain.aspect === '남향' && ' ☀️'}
                          </Text>
                        </View>
                      )}

                      {selectedField.terrain.elevation && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>고도</Text>
                          <Text style={styles.detailValue}>{selectedField.terrain.elevation}m</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* 재배 적합도 */}
                  {selectedField.suitability && (
                    <>
                      <View style={styles.sectionDivider} />
                      <Text style={styles.sectionTitle}>💡 재배 적합도</Text>

                      {selectedField.suitability.grape_score && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>포도 재배</Text>
                          <Text style={styles.detailValue}>
                            {selectedField.suitability.rating} ({selectedField.suitability.grape_score}점)
                          </Text>
                        </View>
                      )}

                      {selectedField.suitability.strengths && selectedField.suitability.strengths.length > 0 && (
                        <View style={styles.strengthsBox}>
                          <Text style={styles.strengthsTitle}>✅ 장점:</Text>
                          {selectedField.suitability.strengths.map((strength, idx) => (
                            <Text key={idx} style={styles.strengthsText}>• {strength}</Text>
                          ))}
                        </View>
                      )}

                      {selectedField.suitability.limitations && selectedField.suitability.limitations.length > 0 && (
                        <View style={styles.limitationsBox}>
                          <Text style={styles.limitationsTitle}>⚠️ 개선 필요:</Text>
                          {selectedField.suitability.limitations.map((limitation, idx) => (
                            <Text key={idx} style={styles.limitationsText}>• {limitation}</Text>
                          ))}
                        </View>
                      )}
                    </>
                  )}

                  {/* 관리 조언 */}
                  {selectedField.management_advice && (
                    <>
                      <View style={styles.sectionDivider} />
                      <Text style={styles.sectionTitle}>🎯 관리 조언</Text>

                      {selectedField.management_advice.irrigation && (
                        <View style={styles.adviceBox}>
                          <Text style={styles.adviceLabel}>💧 관수:</Text>
                          <Text style={styles.adviceText}>{selectedField.management_advice.irrigation}</Text>
                        </View>
                      )}

                      {selectedField.management_advice.fertilizer && (
                        <View style={styles.adviceBox}>
                          <Text style={styles.adviceLabel}>🌿 비료:</Text>
                          <Text style={styles.adviceText}>{selectedField.management_advice.fertilizer}</Text>
                        </View>
                      )}

                      {selectedField.management_advice.soil_improvement && (
                        <View style={styles.adviceBox}>
                          <Text style={styles.adviceLabel}>🌱 토양개량:</Text>
                          <Text style={styles.adviceText}>{selectedField.management_advice.soil_improvement}</Text>
                        </View>
                      )}
                    </>
                  )}
                </ScrollView>

                {!myFarm && (
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => openRegisterModal(selectedField)}
                  >
                    <Text style={styles.registerButtonText}>🏡 내 농장으로 등록</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeDetailModal}
                >
                  <Text style={styles.closeButtonText}>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 농장 등록 모달 */}
      <Modal
        visible={showRegisterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏡 농장 등록</Text>
              <TouchableOpacity onPress={() => setShowRegisterModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedField && (
              <>
                <Text style={styles.registerLabel}>농장 이름을 입력하세요</Text>
                <TextInput
                  style={styles.registerInput}
                  placeholder="예: 김천 포도농장"
                  value={farmName}
                  onChangeText={setFarmName}
                />

                <View style={styles.registerInfo}>
                  <Text style={styles.registerInfoText}>
                    📏 면적: {(selectedField.fl_ar ?? 0).toLocaleString()}㎡
                  </Text>
                  <Text style={styles.registerInfoText}>
                    🏷️ 분류: {selectedField.fl_nm}
                  </Text>
                  <Text style={styles.registerInfoText}>
                    📍 주소: {selectedField.address}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleRegisterFarm}
                >
                  <Text style={styles.confirmButtonText}>등록하기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  map: {
    flex: 1,
  },
  // 상단 정보
  topInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  infoCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  infoSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  myFarmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 8,
  },
  sourceText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // 하단 컨트롤
  bottomControls: {
    position: 'absolute',
    bottom: 65, // 하단 녹색바(45px) + 여백(20px)
    left: 16,
    right: 16,
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  controlButtonIcon: {
    fontSize: 24,
  },
  // 필터
  filterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  // 반경 선택
  radiusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  radiusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  radiusButtonActive: {
    backgroundColor: '#10B981',
  },
  radiusButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  radiusButtonTextActive: {
    color: 'white',
  },
  // 마커
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerIcon: {
    fontSize: 24,
  },
  smallMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  smallMarkerText: {
    fontSize: 16,
  },
  // 상세 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  closeIcon: {
    fontSize: 24,
    color: '#9CA3AF',
    padding: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 2,
    textAlign: 'right',
  },
  registerButton: {
    marginTop: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  closeButton: {
    marginTop: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  // 섹션 구분
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 4,
  },
  // 장점/제약 박스
  strengthsBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  strengthsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 6,
  },
  strengthsText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 20,
    marginBottom: 2,
  },
  limitationsBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  limitationsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 6,
  },
  limitationsText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 20,
    marginBottom: 2,
  },
  // 관리 조언 박스
  adviceBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  adviceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  // 등록 모달
  registerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  registerInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  registerInfo: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  registerInfoText: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 6,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default FarmMapAdvancedScreen;

