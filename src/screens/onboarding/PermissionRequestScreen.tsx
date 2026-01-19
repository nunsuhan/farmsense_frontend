import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../theme/colors';

const PermissionRequestScreen = () => {
    const navigation = useNavigation<any>();

    const handleContinue = async () => {
        // In a real implementation effectively request permissions here using react-native-permissions
        // For now, we just navigate to the next step as this is a "warm-up" screen
        // requesting the user's understanding first.
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTab' }],
        });
    };

    const PermissionItem = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
        <View style={styles.itemContainer}>
            <View style={styles.iconBox}>
                <Feather name={icon} size={28} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>{title}</Text>
                <Text style={styles.itemDesc}>{description}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>앱 사용을 위해{'\n'}권한이 필요해요</Text>
                    <Text style={styles.headerSubtitle}>
                        서비스 이용에 꼭 필요한 권한만{'\n'}요청드립니다.
                    </Text>
                </View>

                <View style={styles.listContainer}>
                    <PermissionItem
                        icon="camera"
                        title="카메라 (필수)"
                        description="병해 진단을 위해 포도 잎이나 열매를 촬영할 때 필요합니다."
                    />
                    <PermissionItem
                        icon="map-pin"
                        title="위치 (필수)"
                        description="정확한 우리 동네 농사 날씨와 토양 정보를 분석해 알려드립니다."
                    />
                    <PermissionItem
                        icon="bell"
                        title="알림 (선택)"
                        description="방제 시기와 관수 알림을 적기에 놓치지 않고 받을 수 있습니다."
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.btn} onPress={handleContinue}>
                    <Text style={styles.btnText}>확인했습니다</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        marginTop: 60,
        marginBottom: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
        lineHeight: 36,
    },
    headerSubtitle: {
        fontSize: 16,
        color: colors.textSub,
        lineHeight: 24,
    },
    listContainer: {
        gap: 24,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        paddingTop: 4,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    itemDesc: {
        fontSize: 15,
        color: colors.textSub,
        lineHeight: 22,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    btn: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    btnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PermissionRequestScreen;
