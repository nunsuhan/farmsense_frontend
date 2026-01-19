import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Animated, Easing } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AIDiagnosis = ({ onResultClick, onMenuClick }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanAnimation] = useState(new Animated.Value(0));

    const handleCapture = () => {
        setIsScanning(true);
        // Start animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnimation, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(scanAnimation, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: false,
                })
            ])
        ).start();

        // Simulate scanning delay
        setTimeout(() => {
            setIsScanning(false);
            scanAnimation.stopAnimation();
            if (onResultClick) onResultClick();
        }, 1500);
    };

    const scanTop = scanAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={{ paddingHorizontal: 20, height: '100%', flexDirection: 'column', backgroundColor: '#1E1E2E' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 20 }}>
                <TouchableOpacity
                    onPress={onMenuClick}
                    style={{
                        marginRight: 12,
                        padding: 0
                    }}
                >
                    <Feather name="menu" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, color: 'white' }}>병해 진단</Text>
            </View>

            {/* Camera Preview Mock */}
            <View style={{
                flex: 1,
                backgroundColor: '#000',
                borderRadius: 20,
                position: 'relative',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#333',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                {isScanning && (
                    <Animated.View style={{
                        position: 'absolute',
                        top: scanTop,
                        left: 0,
                        right: 0,
                        height: 4,
                        backgroundColor: '#FFD700',
                        shadowColor: '#FFD700',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 10,
                        zIndex: 10
                    }} />
                )}

                <View style={{ alignItems: 'center' }}>
                    <Ionicons name="camera" size={48} color="#666" style={{ marginBottom: 10, opacity: 0.5 }} />
                    <Text style={{ color: '#666' }}>[카메라 프리뷰]</Text>
                    <Text style={{ fontSize: 12, marginTop: 4, color: '#666' }}>잎을 프레임에 맞춰주세요</Text>
                </View>

                {/* Framing Guides */}
                <View style={[styles.corner, { top: 20, left: 20, borderTopWidth: 4, borderLeftWidth: 4 }]} />
                <View style={[styles.corner, { top: 20, right: 20, borderTopWidth: 4, borderRightWidth: 4 }]} />
                <View style={[styles.corner, { bottom: 20, left: 20, borderBottomWidth: 4, borderLeftWidth: 4 }]} />
                <View style={[styles.corner, { bottom: 20, right: 20, borderBottomWidth: 4, borderRightWidth: 4 }]} />
            </View>

            <View>
                <Text style={{ marginBottom: 8, color: 'white' }}>촬영 가이드</Text>
                <View style={{ paddingLeft: 10 }}>
                    <Text style={styles.guideText}>• 자연광에서 촬영</Text>
                    <Text style={styles.guideText}>• 20-30cm 거리 유지</Text>
                    <Text style={styles.guideText}>• 흔들리지 않게 주의</Text>
                </View>
            </View>

            <View style={{ marginTop: 'auto', marginBottom: 20, alignItems: 'center' }}>
                <TouchableOpacity
                    onPress={handleCapture}
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        backgroundColor: '#fff',
                        borderWidth: 4,
                        borderColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <View style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#000' }} />
                </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 20 }}>
                <Text style={{ marginBottom: 10, color: 'white' }}>최근 진단</Text>
                <TouchableOpacity
                    onPress={onResultClick}
                    style={styles.recentItem}
                >
                    <Text style={{ color: 'white' }}>12/13 오전</Text>
                    <Text style={{ color: '#4ADE80' }}>🟢 정상</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onResultClick}
                    style={styles.recentItem}
                >
                    <Text style={{ color: 'white' }}>12/12 오후</Text>
                    <Text style={{ color: '#EF4444' }}>🔴 노균병 의심</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#FFD700',
    },
    guideText: {
        fontSize: 13,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    recentItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

export default AIDiagnosis;
