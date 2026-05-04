import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    TextInput,
    Animated,
    PanResponder,
    Platform,
} from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, MapPressEvent } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HelpModal from '../../components/common/HelpModal';
import { useHelpModal } from '../../hooks/useHelpModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; // Added navigation hook
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useStore } from '../../store/useStore';
import { FarmSector } from '../../types/storeTypes';
import * as Location from 'expo-location';
import { farmmapApi } from '../../services/farmmapApi';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const LIST_PANEL_HEIGHT = SCREEN_HEIGHT * 0.55; // Default height for list
const DRAWING_PANEL_HEIGHT = 280; // Compact height for drawing mode
const COLLAPSED_HEIGHT = 90; // Visible height when collapsed

// Area calculation helper (Shoelace Formula)
const calculatePolygonArea = (coordinates: { latitude: number; longitude: number }[]) => {
    const earthRadius = 6378137; // meters
    let area = 0;

    if (coordinates.length < 3) return 0;

    for (let i = 0; i < coordinates.length; i++) {
        const j = (i + 1) % coordinates.length;
        const lat1 = coordinates[i].latitude * (Math.PI / 180);
        const lon1 = coordinates[i].longitude * (Math.PI / 180);
        const lat2 = coordinates[j].latitude * (Math.PI / 180);
        const lon2 = coordinates[j].longitude * (Math.PI / 180);

        area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs(area * earthRadius * earthRadius / 2);
    return area; // Square meters
};

const SectorManagementScreen: React.FC = () => {
    const mapRef = useRef<MapView>(null);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation(); // Hook for back navigation
    const { sectors, addSector, removeSector, updateSector, fetchSectors, farmInfo } = useStore();
    const currentFarmId = useStore((s) => s.currentFarmId);

    // Fetch sectors on mount
    useEffect(() => {
        const loadMapData = async () => {
            if (!currentFarmId) return;
            const farmId = currentFarmId;
            await fetchSectors(String(farmId));
            try {
                const mapData = await farmmapApi.getFarmMapData(farmId);
                    if (mapData && mapData.center) {
                        mapRef.current?.animateToRegion({
                            latitude: mapData.center.lat,
                            longitude: mapData.center.lon,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }, 500);
                    }
            } catch (e) {
                // Farm map data 로드 실패 시 현재 위치 사용
            }
        };
        loadMapData();
    }, [currentFarmId]);

    // Map State
    const [region, setRegion] = useState({
        latitude: 36.11, // Default fallback
        longitude: 128.11,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [mapType, setMapType] = useState<'standard' | 'hybrid' | 'satellite'>('hybrid');

    // Drawing State
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<{ latitude: number; longitude: number }[]>([]);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [sectorName, setSectorName] = useState('');
    const [sectorType, setSectorType] = useState<'outdoor' | 'greenhouse'>('greenhouse');
    const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
    const { isVisible: showHelp, showHelp: openHelp, closeHelp } = useHelpModal('HELP_SECTOR');

    // Animation / Bottom Sheet State
    // Determine active panel height based on mode
    const activePanelHeight = isDrawing ? DRAWING_PANEL_HEIGHT : LIST_PANEL_HEIGHT;

    // translateY: 0 = Expanded, (activePanelHeight - COLLAPSED_HEIGHT) = Collapsed
    const panY = useRef(new Animated.Value(LIST_PANEL_HEIGHT - COLLAPSED_HEIGHT)).current;

    // Helper to force specific state
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Update animation when isDrawing changes or isPanelOpen changes
    useEffect(() => {
        const targetValue = isPanelOpen
            ? 0
            : activePanelHeight - COLLAPSED_HEIGHT;

        Animated.spring(panY, {
            toValue: targetValue,
            useNativeDriver: true,
            bounciness: 4,
        }).start();
    }, [isPanelOpen, isDrawing, activePanelHeight]);

    // Pan Responder for dragging
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Determine if vertical swipe
                return Math.abs(gestureState.dy) > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                // Simplified: for now just capture gestures, we rely on release to snap
            },
            onPanResponderRelease: (_, gestureState) => {
                // If dragged up significantly, expand. If dragged down, collapse.
                if (gestureState.dy < -50) {
                    setIsPanelOpen(true);
                } else if (gestureState.dy > 50) {
                    setIsPanelOpen(false);
                } else {
                    // Tap handling effectively done by TouchableOpacity wrapper in render if needed,
                    // but here we just rely on drag.
                }
            }
        })
    ).current;


    // Initial Location
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const location = await Location.getCurrentPositionAsync({});
            mapRef.current?.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        })();
    }, []);

    const handleMapPress = (e: MapPressEvent) => {
        if (!isDrawing) return;

        const newPoint = e.nativeEvent.coordinate;
        setCurrentPoints([...currentPoints, newPoint]);
    };

    const handleUndo = () => {
        setCurrentPoints(prev => prev.slice(0, -1));
    };

    const handleStartDrawing = () => {
        setIsDrawing(true);
        setCurrentPoints([]);
        setSelectedSectorId(null);
        // In drawing mode, we keep panel open but it's smaller now
        setIsPanelOpen(true);
    };

    const handleCancelDrawing = () => {
        setIsDrawing(false);
        setCurrentPoints([]);
        setIsPanelOpen(true); // Open panel back up to show list
    };

    const handleSaveDrawing = () => {
        if (currentPoints.length < 3) {
            Alert.alert('알림', '최소 3개 이상의 점을 찍어주세요.');
            return;
        }
        setSectorName(`구역 ${sectors.length + 1}`);
        setModalVisible(true);
    };

    const confirmSaveSector = async () => {
        const area = calculatePolygonArea(currentPoints);
        const newSector: FarmSector = {
            id: Date.now().toString(),
            name: sectorName,
            type: sectorType,
            coordinates: currentPoints,
            area: area,
            sensorIds: [],
            color: sectorType === 'greenhouse' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)' // Green vs Orange
        };

        await addSector(newSector);

        // Sync Geo with Farm Address
        try {
            await farmmapApi.syncSectorGeo(newSector.id);
            console.log('Sector Geo Synced');
            Alert.alert('저장 완료', `${sectorName} 저장 및 주소 동기화 완료`);
        } catch (e) {
            console.log('Sector Geo Sync Failed', e);
            Alert.alert('저장 완료', `${sectorName} 저장 완료 (주소 동기화 실패)`);
        }

        setModalVisible(false);
        setIsDrawing(false);
        setCurrentPoints([]);
        setIsPanelOpen(true); // Show list again
    };

    const handleDeleteSector = (id: string) => {
        Alert.alert('구역 삭제', '정말 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            { text: '삭제', style: 'destructive', onPress: () => removeSector(id) }
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Map is Full Screen */}
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={region}
                mapType={mapType}
                showsUserLocation
                showsMyLocationButton={false}
                onPress={handleMapPress}
                onMapReady={() => console.log('✅ [SectorManage] 지도 로딩 완료')}
            >
                {/* Existing Sectors */}
                {sectors.map(sector => (
                    <Polygon
                        key={sector.id}
                        coordinates={sector.coordinates}
                        fillColor={sector.color || 'rgba(16, 185, 129, 0.5)'}
                        strokeColor={sector.color ? sector.color.replace('0.5', '1') : '#10B981'} // Solid border
                        strokeWidth={2}
                        tappable
                        onPress={() => Alert.alert(sector.name, `면적: ${Math.round(sector.area)}m²\n타입: ${sector.type === 'greenhouse' ? '시설하우스' : '노지'}`)}
                    />
                ))}

                {/* Drawing Polygon */}
                {isDrawing && currentPoints.length > 0 && (
                    <>
                        <Polygon
                            coordinates={currentPoints}
                            fillColor="rgba(59, 130, 246, 0.3)" // Blue for drawing
                            strokeColor="#3B82F6"
                            strokeWidth={2}
                        />
                        {currentPoints.map((point, index) => (
                            <Marker
                                key={index}
                                coordinate={point}
                                anchor={{ x: 0.5, y: 0.5 }}
                            >
                                <View style={styles.drawingPoint} />
                            </Marker>
                        ))}
                    </>
                )}
            </MapView>

            {/* Top Control Bar */}
            <View style={[styles.topBar, { top: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>구역 관리</Text>
                </View>

                {/* Right Buttons: Map Toggle & Help */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                        style={styles.mapToggleBtn}
                        onPress={() => setMapType(prev => prev === 'standard' ? 'hybrid' : 'standard')}
                    >
                        <Ionicons
                            name={mapType === 'standard' ? "images" : "map"}
                            size={20}
                            color="#1F2937"
                        />
                        <Text style={styles.mapToggleText}>
                            {mapType === 'standard' ? '위성' : '지도'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.mapToggleBtn, { width: 40, paddingHorizontal: 0, justifyContent: 'center', alignItems: 'center' }]}
                        onPress={openHelp}
                    >
                        <MaterialCommunityIcons name="help-circle-outline" size={24} color="#1F2937" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Sliding Bottom Panel */}
            <Animated.View
                style={[
                    styles.bottomSheet,
                    {
                        height: activePanelHeight,
                        transform: [{ translateY: panY }]
                    }
                ]}
            >
                {/* Drag Handle / Header */}
                <View
                    style={styles.sheetHeader}
                    {...panResponder.panHandlers}
                >
                    <View style={styles.dragHandle} />
                    <TouchableOpacity
                        style={styles.headerContent}
                        activeOpacity={1}
                        onPress={() => setIsPanelOpen(!isPanelOpen)}
                    >
                        {isDrawing ? (
                            <Text style={styles.sheetTitle}>구역 그리기 중...</Text>
                        ) : (
                            <Text style={styles.sheetTitle}>내 농장 구역 <Text style={styles.countBadge}>({sectors.length})</Text></Text>
                        )}
                        <Ionicons
                            name={isPanelOpen ? "chevron-down" : "chevron-up"}
                            size={24}
                            color="#9CA3AF"
                        />
                    </TouchableOpacity>
                </View>

                {/* Content Area */}
                <View style={styles.sheetContent}>
                    {isDrawing ? (
                        <View style={styles.drawingControls}>
                            <Text style={styles.drawingGuide}>
                                지도 위를 눌러 꼭짓점을 추가하세요.{'\n'}
                                ({currentPoints.length}개 선택됨)
                            </Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.secondaryBtn} onPress={handleUndo}>
                                    <Ionicons name="arrow-undo" size={20} color="#4B5563" />
                                    <Text style={styles.secondaryBtnText}>되돌리기</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: '#FEE2E2' }]} onPress={handleCancelDrawing}>
                                    <Text style={[styles.secondaryBtnText, { color: '#DC2626' }]}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveDrawing}>
                                    <Ionicons name="save-outline" size={20} color="white" />
                                    <Text style={styles.primaryBtnText}>저장</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            {/* Add Button - Visible even when collapsed/scrolled */}
                            <TouchableOpacity style={styles.addNewRow} onPress={handleStartDrawing}>
                                <View style={styles.addIconCircle}>
                                    <Ionicons name="add" size={24} color="white" />
                                </View>
                                <Text style={styles.addNewText}>새로운 구역 추가하기</Text>
                            </TouchableOpacity>

                            <FlatList
                                data={sectors}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.listContainer}
                                style={{ flex: 1 }}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.sectorItem}
                                        onPress={() => {
                                            // Focus map on this sector
                                            if (item.coordinates && item.coordinates.length > 0) {
                                                const centerLat = item.coordinates.reduce((sum, p) => sum + p.latitude, 0) / item.coordinates.length;
                                                const centerLon = item.coordinates.reduce((sum, p) => sum + p.longitude, 0) / item.coordinates.length;
                                                mapRef.current?.animateToRegion({
                                                    latitude: centerLat,
                                                    longitude: centerLon,
                                                    latitudeDelta: 0.002,
                                                    longitudeDelta: 0.002
                                                });
                                                setIsPanelOpen(false); // Collapse to see map
                                            }
                                        }}
                                    >
                                        <View style={styles.sectorInfo}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <View style={[styles.typeBadge, { backgroundColor: item.type === 'greenhouse' ? '#DCFCE7' : '#FEF3C7' }]}>
                                                    <Text style={[styles.typeText, { color: item.type === 'greenhouse' ? '#166534' : '#B45309' }]}>
                                                        {item.type === 'greenhouse' ? '시설' : '노지'}
                                                    </Text>
                                                </View>
                                                <Text style={styles.sectorName}>{item.name}</Text>
                                            </View>
                                            <Text style={styles.sectorArea}>
                                                {Math.round(item.area).toLocaleString()}m² ({Math.round(item.area / 3.3).toLocaleString()}평)
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteSector(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={() => (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>등록된 구역이 없습니다.</Text>
                                    </View>
                                )}
                            />
                        </>
                    )}
                </View>
            </Animated.View>

            <HelpModal
                visible={showHelp}
                onClose={closeHelp}
                title="구역 관리"
                subtitle="어디서, 어떤 일이 일어났는지 지도가 기억합니다."
                points={[
                    {
                        title: '영농 활동의 위치 추적',
                        description: '영농일지 작성 시 GPS를 기반으로 작업 위치를 기록하면, 구역 관리 화면에서 해당 구역에 수행된 작업(비료 살포, 전정, 수확 등)이 자동으로 매핑됩니다.'
                    },
                    {
                        title: '공간적 문제 파악',
                        description: '특정 구역에서만 병해충이 반복되거나 생육이 부진하다면, 지도를 통해 해당 위치의 이력을 추적하여 근본적인 원인을 분석할 수 있습니다.'
                    },
                    {
                        title: '정밀한 자원 관리',
                        description: '구역별로 누적된 작업 데이터를 분석하여, 불필요한 중복 작업을 방지하고 농장 전체의 효율성을 극대화합니다.'
                    }
                ]}
            />

            {/* Save Modal */}
            < Modal visible={modalVisible} transparent animationType="fade" >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>구역 저장</Text>

                        <Text style={styles.inputLabel}>구역 이름</Text>
                        <TextInput
                            style={styles.input}
                            value={sectorName}
                            onChangeText={setSectorName}
                            placeholder="예: 1번 하우스, 뒷밭"
                        />

                        <Text style={styles.inputLabel}>재배 형태</Text>
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeOption, sectorType === 'greenhouse' && styles.activeTypeOption]}
                                onPress={() => setSectorType('greenhouse')}
                            >
                                <Ionicons name="cube-outline" size={20} color={sectorType === 'greenhouse' ? '#10B981' : '#6B7280'} />
                                <Text style={[styles.typeOptionText, sectorType === 'greenhouse' && styles.activeTypeOptionText]}>시설하우스</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeOption, sectorType === 'outdoor' && styles.activeTypeOption]}
                                onPress={() => setSectorType('outdoor')}
                            >
                                <Ionicons name="leaf-outline" size={20} color={sectorType === 'outdoor' ? '#10B981' : '#6B7280'} />
                                <Text style={[styles.typeOptionText, sectorType === 'outdoor' && styles.activeTypeOptionText]}>노지 재배</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={confirmSaveSector}>
                                <Text style={styles.confirmBtnText}>저장</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal >
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    // Top Bar
    topBar: {
        position: 'absolute',
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        marginLeft: 8,
    },
    pageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    mapToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    mapToggleText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
    },

    // Bottom Sheet
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    sheetHeader: {
        height: 60,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginTop: 10,
        marginBottom: 4,
    },
    headerContent: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    countBadge: {
        color: '#10B981',
    },
    sheetContent: {
        flex: 1,
    },

    // List Style
    addNewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#10B981',
    },
    addIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addNewText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#065F46',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    sectorItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sectorInfo: {
        gap: 6,
    },
    typeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    sectorName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    sectorArea: {
        fontSize: 13,
        color: '#6B7280',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9CA3AF',
    },

    // Drawing UI
    drawingPoint: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3B82F6',
        borderWidth: 2,
        borderColor: 'white',
    },
    drawingControls: {
        padding: 24,
        gap: 20,
        // Ensure content fits within 280px or less
    },
    drawingGuide: {
        textAlign: 'center',
        color: '#374151',
        fontSize: 15,
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        flex: 1,
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    secondaryBtnText: {
        color: '#4B5563',
        fontWeight: '600',
        fontSize: 14,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    typeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    activeTypeOption: {
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
    },
    typeOptionText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    activeTypeOptionText: {
        color: '#10B981',
    },
    modalBtnRow: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#4B5563',
        fontWeight: '700',
    },
    confirmBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#10B981',
        alignItems: 'center',
    },
    confirmBtnText: {
        color: 'white',
        fontWeight: '700',
    },
});

export default SectorManagementScreen;
