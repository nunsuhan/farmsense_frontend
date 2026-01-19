// src/screens/settings/AppInfoScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';

const AppInfoScreen: React.FC = () => {
    const navigation = useNavigation();

    const infoItems = [
        { label: '버전', value: '1.0.0' },
        { label: '빌드 날짜', value: '2024.12.17' },
        { label: '개발사', value: 'FarmSense' },
    ];

    return (
        <ScreenWrapper title="앱 정보" showBack showMenu={true}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.logoSection}>
                    <View style={styles.logoPlaceholder}>
                        <Ionicons name="leaf" size={48} color="#10B981" />
                    </View>
                    <Text style={styles.appName}>FarmSense</Text>
                    <Text style={styles.appSlogan}>AI가 포도를 이해합니다</Text>
                </View>

                <View style={styles.section}>
                    {infoItems.map((item, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.rowLabel}>{item.label}</Text>
                            <Text style={styles.rowValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://farmsense.kr')}>
                        <Text style={styles.linkText}>홈페이지</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkRow} onPress={() => (navigation as any).navigate('PrivacyPolicy')}>
                        <Text style={styles.linkText}>개인정보처리방침</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkRow} onPress={() => (navigation as any).navigate('Terms')}>
                        <Text style={styles.linkText}>이용약관</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://opensource.org/licenses')}>
                        <Text style={styles.linkText}>오픈소스 라이선스</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.copyright}>© 2024 FarmSense. All rights reserved.</Text>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
    content: { flex: 1 },
    logoSection: { alignItems: 'center', paddingVertical: 40 },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: { fontSize: 24, fontWeight: 'bold', color: '#374151', marginTop: 16 },
    appSlogan: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    section: { backgroundColor: '#fff', marginTop: 16 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    rowLabel: { fontSize: 15, color: '#374151' },
    rowValue: { fontSize: 15, color: '#6B7280' },
    linkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    linkText: { fontSize: 15, color: '#374151' },
    copyright: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, paddingVertical: 24 },
});

export default AppInfoScreen;
