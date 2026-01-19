import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useStore } from '../../store/useStore';

const CROPS = ['샤인머스캣', '캠벨얼리', 'MBA', '거봉', '기타'];
const REGIONS = ['경상북도', '경상남도', '충청북도', '충청남도', '경기도', '전라북도', '전라남도', '강원도', '제주도'];

const FarmRegistrationScreen = () => {
    const navigation = useNavigation<any>();
    const setFarmInfo = useStore((state) => state.setFarmInfo);
    const [farmName, setFarmName] = useState('');
    const [crop, setCrop] = useState('');
    const [region, setRegion] = useState('');
    const [area, setArea] = useState('');
    const [isRegionModalVisible, setRegionModalVisible] = useState(false);

    const handleSubmit = async () => {
        const farmInfo = {
            farmName,
            variety: crop,
            region,
            cultivationType: '비가림', // Default or add input
            plantingYear: new Date().getFullYear().toString(), // Default or add input
        };

        await setFarmInfo({
            ...farmInfo,
            // Add other optional fields if needed mapping from area etc
        });

        console.log('Farm Info Saved:', farmInfo);
        navigation.navigate('PermissionRequest');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>농장 등록</Text>
                <Text style={styles.headerSubtitle}>
                    정확한 진단과 관리를 위해{'\n'}농장 정보를 입력해주세요. (3초 컷!)
                </Text>
            </View>

            <View style={styles.form}>
                {/* Farm Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>농장 이름 <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="예: 문수농장"
                        value={farmName}
                        onChangeText={setFarmName}
                        placeholderTextColor={colors.textDisabled}
                    />
                </View>

                {/* Crop Variety - Radio */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>재배 품종 <Text style={styles.required}>*</Text></Text>
                    <View style={styles.radioContainer}>
                        {CROPS.map((c) => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.radioBtn, crop === c && styles.radioBtnSelected]}
                                onPress={() => setCrop(c)}
                            >
                                <Text style={[styles.radioText, crop === c && styles.radioTextSelected]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Region - Dropdown */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>지역 <Text style={styles.required}>*</Text></Text>
                    <TouchableOpacity
                        style={styles.selectBtn}
                        onPress={() => setRegionModalVisible(true)}
                    >
                        <Text style={region ? styles.selectText : styles.placeholderText}>
                            {region || '지역을 선택해주세요'}
                        </Text>
                        <Feather name="chevron-down" size={20} color={colors.textSub} />
                    </TouchableOpacity>
                </View>

                {/* Area */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>재배 면적 (평/m²)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="예: 1000"
                        value={area}
                        onChangeText={setArea}
                        keyboardType="numeric"
                        placeholderTextColor={colors.textDisabled}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, (!farmName || !crop || !region) && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={!farmName || !crop || !region}
                >
                    <Text style={styles.submitBtnText}>완료</Text>
                </TouchableOpacity>
            </View>

            {/* Region Modal */}
            <Modal visible={isRegionModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>지역 선택</Text>
                            <TouchableOpacity onPress={() => setRegionModalVisible(false)}>
                                <Feather name="x" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={REGIONS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setRegion(item);
                                        setRegionModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalItemText, region === item && { color: colors.primary, fontWeight: 'bold' }]}>{item}</Text>
                                    {region === item && <Feather name="check" size={20} color={colors.primary} />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 24,
    },
    header: {
        marginTop: 40,
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: colors.textSub,
        lineHeight: 24,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    required: {
        color: colors.error,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text,
        backgroundColor: colors.surface,
    },
    radioContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    radioBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    radioBtnSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    radioText: {
        color: colors.text,
        fontSize: 14,
    },
    radioTextSelected: {
        color: colors.primaryDark,
        fontWeight: '600',
    },
    selectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        backgroundColor: colors.surface,
    },
    selectText: {
        fontSize: 16,
        color: colors.text,
    },
    placeholderText: {
        fontSize: 16,
        color: colors.textDisabled,
    },
    submitBtn: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnDisabled: {
        backgroundColor: colors.textDisabled,
        shadowOpacity: 0,
        elevation: 0,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
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
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemText: {
        fontSize: 16,
        color: colors.text,
    },
});

export default FarmRegistrationScreen;
