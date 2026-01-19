/**
 * SectorManageScreen.web.tsx
 * 웹 전용 구역 관리 화면
 * 
 * react-native-maps 없이 동작
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SectorManageScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* 상단 컨트롤 */}
            <View style={styles.topControls}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>구역 설정</Text>
                    <Text style={styles.subtitle}>
                        웹에서는 지도 기능을 지원하지 않습니다
                    </Text>
                </View>
            </View>

            {/* 웹 환경 안내 */}
            <View style={styles.webFallbackContainer}>
                <Ionicons name="map-outline" size={80} color="#D1D5DB" />
                <Text style={styles.webFallbackTitle}>
                    웹에서는 지도를 지원하지 않습니다
                </Text>
                <Text style={styles.webFallbackText}>
                    구역 관리 기능을 사용하시려면{'\n'}
                    모바일 앱을 이용해주세요
                </Text>
                <TouchableOpacity
                    style={styles.webFallbackButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.webFallbackButtonText}>돌아가기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    topControls: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    titleContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    webFallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    webFallbackTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 24,
        marginBottom: 12,
        textAlign: 'center',
    },
    webFallbackText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    webFallbackButton: {
        backgroundColor: '#10B981',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    webFallbackButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default SectorManageScreen;
