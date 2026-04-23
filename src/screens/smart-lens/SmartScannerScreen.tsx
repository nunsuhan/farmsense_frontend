import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Text } from '../../components/common/Text';
import { colors } from '../../theme/colors';

import * as ScreenOrientation from 'expo-screen-orientation';
import * as ImagePicker from 'expo-image-picker';
import { diagnoseDisease } from '../../services/api/diagnosis';

export const SmartScannerScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('back');
    const [flash, setFlash] = useState<FlashMode>('off');
    const [activeTab, setActiveTab] = useState<string>('AI 진단');
    const cameraRef = useRef<CameraView>(null);

    // Initial Permission Request
    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission]);

    // Handle Orientation and Camera Facing based on Tab
    useEffect(() => {
        const setMode = async () => {
            // Always lock to Portrait as per user request
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

            if (activeTab === '차폐율') {
                setFacing('front'); // Switch to Front Camera for Canopy
            } else {
                setFacing('back'); // Default to Back Camera
            }
        };
        setMode();

        return () => {
            // Reset to portrait on unmount
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        };
    }, [activeTab]);

    if (!permission) {
        // Camera permissions are still loading.
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <ScreenWrapper backgroundColor="black">
                <View style={styles.container}>
                    <Text style={{ textAlign: 'center', color: 'white', marginTop: 100 }}>We need your permission to show the camera</Text>
                    <TouchableOpacity onPress={requestPermission} style={{ marginTop: 20, padding: 10, backgroundColor: colors.primary, alignSelf: 'center', borderRadius: 8 }}>
                        <Text style={{ color: 'black' }}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 10, alignSelf: 'center' }}>
                        <Text style={{ color: 'white' }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: true,
                    exif: true,
                });
                console.log('📸 Photo Taken:', photo?.uri);

                if (activeTab === '차폐율') {
                    Alert.alert('Canopy Analysis', 'Capturing canopy image for analysis... (Stubbed)');
                } else {
                    Alert.alert('AI Diagnosis', 'Photo captured for diagnosis! (Stubbed)');
                }

            } catch (error) {
                console.error('Failed to take picture:', error);
                Alert.alert('Error', 'Failed to capture photo.');
            }
        }
    };

    const pickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Gallery access is needed to select photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true, // Allow cropping
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                handleImage(imageUri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image.');
        }
    };

    // State for Analysis Overlay
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleImage = async (imageUri: string) => {
        if (activeTab === 'AI 진단') {
            setIsAnalyzing(true);
            try {
                // 실제 AI 진단 API 호출 (60초 타임아웃)
                const diagnosisResult = await diagnoseDisease(imageUri);

                navigation.navigate('DiagnosisResult', {
                    imageUri,
                    result: diagnosisResult
                });
            } catch (error) {
                console.error('Diagnosis Failed:', error);

                // Mock result fallback for demo if server fails
                navigation.navigate('DiagnosisResult', {
                    imageUri,
                    result: {
                        diagnosis: {
                            disease_name: "탄저병 (의심)",
                            confidence: 0.885,
                            disease_code: 'anthracnose',
                            severity: '중증',
                            top_3: []
                        },
                        prescription: {
                            summary: "이미지 분석 결과 탄저병 초기 증상으로 보입니다. (서버 연결 실패로 인한 예시 결과입니다)",
                            recommended_pesticides: [],
                            action_items: ["즉시 방제 필요"],
                            prevention_tips: [],
                            sources: []
                        },
                        metadata: { model_version: 'mock', inference_time_ms: 0, rag_time_ms: 0 }
                    }
                });
            } finally {
                setIsAnalyzing(false);
            }
        } else {
            Alert.alert('Notice', 'Gallery selection is only implemented for AI Diagnosis currently.');
        }
    };

    return (
        <ScreenWrapper backgroundColor="black">
            <View style={styles.container}>
                <CameraView
                    style={StyleSheet.absoluteFill}
                    facing={facing}
                    flash={flash}
                    ref={cameraRef}
                >
                    <View style={styles.cameraUiContainer}>
                        {/* Top Toolbar */}
                        <View style={styles.topToolbar}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                                <Ionicons name="close" size={28} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
                                <Ionicons name={flash === 'on' ? "flash" : "flash-off"} size={28} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Scan Area Overlay */}
                        <View style={styles.scanArea}>
                            {activeTab === '차폐율' ? (
                                // Custom Overlay for Canopy (Wider area logic or grid stubs)
                                <View style={[styles.guideContainer, { bottom: '10%' }]}>
                                    <Text style={styles.guideText}>잎 면적을 측정 하므로 하늘을 향해{"\n"}햇빛이 닿지 않도록 촬영해주세요</Text>
                                </View>
                            ) : activeTab === '생육 기록' ? (
                                // Custom Overlay for Growth Record
                                <>
                                    <View style={[styles.corner, styles.tl]} />
                                    <View style={[styles.corner, styles.tr]} />
                                    <View style={[styles.corner, styles.bl]} />
                                    <View style={[styles.corner, styles.br]} />

                                    <View style={[styles.guideContainer, { bottom: '10%' }]}>
                                        <Text style={styles.guideText}>나무의 수형 전체가 기록되도록{"\n"}촬영해주세요</Text>
                                    </View>
                                </>
                            ) : (
                                // Default Overlay for AI Diagnosis
                                <>
                                    <View style={[styles.corner, styles.tl]} />
                                    <View style={[styles.corner, styles.tr]} />
                                    <View style={[styles.corner, styles.bl]} />
                                    <View style={[styles.corner, styles.br]} />

                                    <View style={styles.guideContainer}>
                                        <Text style={styles.guideText}>잎의 병반 부분이 잘 보이도록{"\n"}영역 안에 맞춰주세요</Text>
                                    </View>
                                </>
                            )}
                        </View>

                        {isAnalyzing && (
                            <View style={styles.analyzingOverlay}>
                                <ActivityIndicator size="large" color="#10B981" />
                                <Text style={styles.analyzingText}>분석 중...</Text>
                            </View>
                        )}

                        {/* Bottom Controls */}
                        <View style={styles.bottomControlsContainer}>
                            <View style={styles.tabSwitcherContainer}>
                                <ScrollView horizontal contentContainerStyle={styles.tabRow} showsHorizontalScrollIndicator={false}>
                                    {['AI 진단'].map((tab) => (
                                        <TouchableOpacity
                                            key={tab}
                                            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                                            onPress={() => setActiveTab(tab)}
                                        >
                                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.shutterControls}>
                                <TouchableOpacity style={styles.subBtn} onPress={pickImage}>
                                    <Ionicons name="images-outline" size={28} color="white" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.shutterBtn} onPress={takePicture}>
                                    <View style={styles.shutterInner} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.subBtn} onPress={toggleCameraFacing}>
                                    <Ionicons name="camera-reverse-outline" size={28} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </CameraView>
            </View>
        </ScreenWrapper>
    );
};



const styles = StyleSheet.create({
    // A. Camera Styles
    container: { flex: 1, backgroundColor: 'black' },
    cameraUiContainer: { flex: 1, justifyContent: 'space-between' },
    topToolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40, // Increase top padding for safe area
    },
    iconButton: { padding: 8 },

    scanArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    guideContainer: {
        position: 'absolute',
        bottom: '20%', // 4각형 아래쪽
        width: '80%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    guideText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#10B981', // 포도박사 그린
        borderWidth: 4,
    },
    tl: { top: '25%', left: '15%', borderRightWidth: 0, borderBottomWidth: 0 },
    tr: { top: '25%', right: '15%', borderLeftWidth: 0, borderBottomWidth: 0 },
    bl: { bottom: '25%', left: '15%', borderRightWidth: 0, borderTopWidth: 0 },
    br: { bottom: '25%', right: '15%', borderLeftWidth: 0, borderTopWidth: 0 },

    bottomControlsContainer: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingBottom: 40,
        paddingTop: 10,
    },
    tabSwitcherContainer: {
        height: 50,
        marginBottom: 10,
        justifyContent: 'center',
        width: '100%',
    },
    tabRow: {
        flexDirection: 'row',
        // justifyContent: 'space-evenly', // Changed to allow scrolling if needed
        alignItems: 'center',
        paddingHorizontal: 10,
        gap: 10, // Add gap between items
    },
    tabItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tabItemActive: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)', // Gold tint
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    tabText: {
        color: '#BBB',
        fontSize: 16,
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#FFD700', // Gold color for active text
        fontWeight: 'bold',
    },

    shutterControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    shutterBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#10B981',
    },
    subBtn: { padding: 10 },

    // B. Result Styles (Partial update for preview)
    imageCard: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        position: 'relative',
    },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    analyzingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    analyzingText: { color: '#10B981', marginTop: 12, fontWeight: 'bold', fontSize: 16 },
});
