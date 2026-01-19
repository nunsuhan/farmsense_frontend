// FarmMapScreen - 농장 지도 (팜맵)
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/common/ScreenWrapper';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { farmmapApi } from '../services/farmmapApi';
import { Farm } from '../types/api.types';
import { requestLocationPermission, getCurrentLocation } from '../utils/exifExtractor';

interface LocationState {
  coords: {
    latitude: number;
    longitude: number;
  };
}

const FarmMapScreen: React.FC = () => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km
  const mapRef = useRef<MapView>(null);

  // 초기 위치 (김천시)
  const DEFAULT_LOCATION = {
    latitude: 36.1399,
    longitude: 128.1139,
  };

  // 위치 권한 요청 및 현재 위치 가져오기
  useEffect(() => {
    (async () => {
      try {
        // 위치 권한 요청
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
          console.log('⚠️ [FarmMap] 위치 권한 거부됨');
          Alert.alert(
            '위치 권한 필요',
            '주변 농장을 검색하려면 위치 권한이 필요합니다.\n기본 위치(김천시)로 설정됩니다.'
          );
          // 기본 위치로 설정
          await loadNearbyFarms(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
          setIsLoading(false);
          return;
        }

        // 현재 위치 가져오기
        console.log('📍 [FarmMap] 현재 위치 가져오는 중...');
        const locationData = await getCurrentLocation();

        if (locationData) {
          const currentLocation = {
            coords: {
              latitude: locationData.latitude,
              longitude: locationData.longitude
            }
          };
          setLocation(currentLocation);
          console.log('✅ [FarmMap] 현재 위치:', currentLocation.coords);

          // 주변 농장 검색
          await loadNearbyFarms(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude
          );
        } else {
          throw new Error('위치 정보를 가져 올 수 없습니다.');
        }
      } catch (error) {
        console.error('❌ [FarmMap] 위치 가져오기 실패:', error);
        Alert.alert('오류', '위치를 가져올 수 없습니다.\n기본 위치로 설정됩니다.');
        await loadNearbyFarms(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 주변 농장 검색
  const loadNearbyFarms = async (lat: number, lon: number) => {
    try {
      console.log('🔍 [FarmMap] 주변 농장 검색 중...');
      const response = await farmmapApi.getNearbyFarms({
        lat,
        lon,
        radius: searchRadius,
        crop: '포도',
      });

      setFarms(response.farms);
      console.log('✅ [FarmMap] 농장 검색 완료:', response.count, '개');
    } catch (error) {
      console.error('❌ [FarmMap] 농장 검색 실패:', error);
      Alert.alert('오류', '주변 농장을 검색할 수 없습니다.');
    }
  };

  // 내 위치로 이동
  const handleGoToMyLocation = async () => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }, 1000);
    } else {
      Alert.alert('알림', '현재 위치를 가져올 수 없습니다.');
    }
  };

  // 반경 변경
  const handleChangeRadius = (newRadius: number) => {
    setSearchRadius(newRadius);
    const lat = location?.coords.latitude || DEFAULT_LOCATION.latitude;
    const lon = location?.coords.longitude || DEFAULT_LOCATION.longitude;
    loadNearbyFarms(lat, lon);
  };

  // 농장 마커 클릭
  const handleMarkerPress = (farm: Farm) => {
    setSelectedFarm(farm);
  };

  // 농장 상세 모달 닫기
  const closeDetailModal = () => {
    setSelectedFarm(null);
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <ScreenWrapper title="팜맵 (주변 농장)">
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

  console.log('🗺️ [FarmMap] 렌더링:', {
    centerLocation,
    farmsCount: farms.length,
    isLoading,
  });

  return (
    <ScreenWrapper title="팜맵 (주변 농장)">
      {/* 지도 - 일반 지도 모드 */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...centerLocation,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onMapReady={() => console.log('✅ [FarmMap] 지도 로딩 완료')}
      >
        {/* 검색 반경 표시 */}
        <Circle
          center={centerLocation}
          radius={searchRadius}
          fillColor="rgba(16, 185, 129, 0.1)"
          strokeColor="rgba(16, 185, 129, 0.5)"
          strokeWidth={2}
        />

        {/* 농장 마커들 */}
        {farms.map((farm) => {
          // location 객체 존재 확인 및 기본값 설정
          const latitude = farm.location?.lat ?? farm.latitude ?? DEFAULT_LOCATION.latitude;
          const longitude = farm.location?.lon ?? farm.longitude ?? DEFAULT_LOCATION.longitude;

          return (
            <Marker
              key={farm.id}
              coordinate={{
                latitude,
                longitude,
              }}
              title={farm.name}
              description={farm.variety}
              onPress={() => handleMarkerPress(farm)}
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerIcon}>🍇</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* 상단 정보 */}
      <View style={styles.topInfo}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            🍇 포도 농장 <Text style={styles.infoCount}>{farms.length}개</Text>
          </Text>
          <Text style={styles.infoSubtext}>반경 {(searchRadius / 1000).toFixed(1)}km</Text>
        </View>
      </View>

      {/* 하단 컨트롤 */}
      <View style={styles.bottomControls}>
        {/* 내 위치 버튼 */}
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={handleGoToMyLocation}
        >
          <Text style={styles.myLocationIcon}>📍</Text>
        </TouchableOpacity>

        {/* 반경 선택 */}
        <View style={styles.radiusSelector}>
          <Text style={styles.radiusLabel}>검색 반경</Text>
          <View style={styles.radiusButtons}>
            {[2000, 5000, 10000].map((radius) => (
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

      {/* 농장 상세 모달 */}
      <Modal
        visible={selectedFarm !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedFarm && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedFarm.name}</Text>
                  <TouchableOpacity onPress={closeDetailModal}>
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* 농장 정보 */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>👤 농장주</Text>
                    <Text style={styles.detailValue}>{selectedFarm.owner}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🍇 작물</Text>
                    <Text style={styles.detailValue}>{selectedFarm.crop}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🌱 품종</Text>
                    <Text style={styles.detailValue}>{selectedFarm.variety}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📏 면적</Text>
                    <Text style={styles.detailValue}>{selectedFarm.area}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📊 생산량</Text>
                    <Text style={styles.detailValue}>{selectedFarm.production}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 주소</Text>
                    <Text style={styles.detailValue}>{selectedFarm.address}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📞 연락처</Text>
                    <Text style={styles.detailValue}>{selectedFarm.phone}</Text>
                  </View>

                  {selectedFarm.description && (
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.descriptionLabel}>📝 설명</Text>
                      <Text style={styles.descriptionText}>{selectedFarm.description}</Text>
                    </View>
                  )}
                </ScrollView>

                {/* 닫기 버튼 */}
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
  // 하단 컨트롤
  bottomControls: {
    position: 'absolute',
    bottom: 65, // 하단 녹색바(45px) + 여백(20px)
    left: 16,
    right: 16,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 150, // 하단 컨트롤 위로 올림
    right: 0,
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
  myLocationIcon: {
    fontSize: 24,
  },
  // 반경 선택
  radiusSelector: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  radiusButtonActive: {
    backgroundColor: '#10B981',
  },
  radiusButtonText: {
    fontSize: 14,
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
    maxHeight: '80%',
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
    fontSize: 15,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 2,
    textAlign: 'right',
  },
  descriptionContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default FarmMapScreen;






