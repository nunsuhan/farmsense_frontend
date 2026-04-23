// src/screens/settings/FarmDetailScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';

const FarmDetailScreen: React.FC = () => {
    const navigation = useNavigation();

    // 입력 상태 관리
    const [farmName, setFarmName] = useState('문수농원');
    const [address, setAddress] = useState('경북 김천시 봉산면');
    const [area, setArea] = useState('3000');
    const [areaUnit, setAreaUnit] = useState('평'); // '평' or 'ha'
    const [varieties, setVarieties] = useState<string[]>(['샤인머스캣']); // 다중 선택
    const [rootstock, setRootstock] = useState('5BB'); // 단일 선택
    const [plantYear, setPlantYear] = useState('2020');
    const [plantCount, setPlantCount] = useState('500주');
    const [facilityType, setFacilityType] = useState('비가림'); // 단일 선택

    // 모달 상태
    const [yearPickerVisible, setYearPickerVisible] = useState(false);

    // 옵션 데이터
    const varietyOptions = ['샤인머스캣', '캠벨얼리', '거봉', 'MBA', '청수', '기타'];
    const rootstockOptions = ['5BB', 'SO4', '3309', '1103P', '자근', '기타'];
    const facilityOptions = ['비가림', '노지', '하우스'];
    const years = Array.from({ length: 10 }, (_, i) => String(2015 + i)); // 2015-2024

    // 품종 토글 (다중 선택)
    const toggleVariety = (variety: string) => {
        if (varieties.includes(variety)) {
            setVarieties(varieties.filter(v => v !== variety));
        } else {
            setVarieties([...varieties, variety]);
        }
    };

    const handleSave = () => {
        if (!farmName) {
            Alert.alert('알림', '농장명을 입력해주세요.');
            return;
        }
        console.log({
            farmName, address, area: `${area}${areaUnit}`, varieties, rootstock, plantYear, plantCount, facilityType
        });
        Alert.alert('저장 완료', '농장 상세 정보가 저장되었습니다.');
        navigation.goBack();
    };

    return (
        <ScreenWrapper
            title="농장 상세 정보"
            showBack
            showMenu={false}
            headerRight={
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveButton}>저장</Text>
                </TouchableOpacity>
            }
        >
            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* 1. 농장명 */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>농장명</Text>
                    <TextInput
                        style={styles.input}
                        value={farmName}
                        onChangeText={setFarmName}
                        placeholder="예: 문수농원"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* 2. 주소 */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>주소</Text>
                    <TextInput
                        style={styles.input}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="예: 경북 김천시..."
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* 3. 면적 */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>면적</Text>
                    <View style={styles.areaRow}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={area}
                            onChangeText={setArea}
                            placeholder="3000"
                            keyboardType="numeric"
                            placeholderTextColor="#9CA3AF"
                        />
                        <View style={styles.unitToggle}>
                            <TouchableOpacity
                                style={[styles.unitButton, areaUnit === '평' && styles.unitSelected]}
                                onPress={() => setAreaUnit('평')}
                            >
                                <Text style={[styles.unitText, areaUnit === '평' && styles.unitTextSelected]}>평</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.unitButton, areaUnit === 'ha' && styles.unitSelected]}
                                onPress={() => setAreaUnit('ha')}
                            >
                                <Text style={[styles.unitText, areaUnit === 'ha' && styles.unitTextSelected]}>ha</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 4. 품종 (다중 선택) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>품종 (중복 가능)</Text>
                    <View style={styles.chipContainer}>
                        {varietyOptions.map((v) => (
                            <TouchableOpacity
                                key={v}
                                style={[
                                    styles.chip,
                                    varieties.includes(v) && styles.chipSelected
                                ]}
                                onPress={() => toggleVariety(v)}
                            >
                                <Text style={[
                                    styles.chipText,
                                    varieties.includes(v) && styles.chipTextSelected
                                ]}>{v}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 5. 대목 (단일 선택) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>대목</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {rootstockOptions.map((r) => (
                            <TouchableOpacity
                                key={r}
                                style={[
                                    styles.chip,
                                    rootstock === r && styles.chipSelected
                                ]}
                                onPress={() => setRootstock(r)}
                            >
                                <Text style={[
                                    styles.chipText,
                                    rootstock === r && styles.chipTextSelected
                                ]}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 6. 식재년도 (Picker Modal) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>식재년도</Text>
                    <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setYearPickerVisible(true)}
                    >
                        <Text style={styles.pickerText}>{plantYear}년</Text>
                        <Ionicons name="chevron-down" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* 7. 식재수 */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>식재수</Text>
                    <TextInput
                        style={styles.input}
                        value={plantCount}
                        onChangeText={setPlantCount}
                        placeholder="예: 500주"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* 8. 시설유형 (단일 선택) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>시설유형</Text>
                    <View style={styles.optionGroup}>
                        {facilityOptions.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.optionButton,
                                    facilityType === type && styles.optionSelected,
                                ]}
                                onPress={() => setFacilityType(type)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    facilityType === type && styles.optionTextSelected,
                                ]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

            </ScrollView>

            {/* Year Picker Modal */}
            <Modal visible={yearPickerVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>식재년도 선택</Text>
                        <FlatList
                            data={years}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setPlantYear(item);
                                        setYearPickerVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        plantYear === item && { color: '#10B981', fontWeight: 'bold' }
                                    ]}>{item}년</Text>
                                    {plantYear === item && <Ionicons name="checkmark" size={20} color="#10B981" />}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setYearPickerVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    // Header styles removed
    saveButton: { fontSize: 16, color: '#10B981', fontWeight: 'bold' },
    content: { flex: 1, padding: 20 },

    inputGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#111827',
    },

    // Area
    areaRow: { flexDirection: 'row', gap: 8 },
    unitToggle: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    unitButton: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        minWidth: 50,
        alignItems: 'center',
    },
    unitSelected: { backgroundColor: '#10B981' },
    unitText: { fontSize: 14, color: '#6B7280' },
    unitTextSelected: { color: '#fff', fontWeight: 'bold' },

    // Chips
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 4,
    },
    chipSelected: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
    chipText: { fontSize: 14, color: '#4B5563' },
    chipTextSelected: { color: '#059669', fontWeight: 'bold' },
    horizontalScroll: { flexDirection: 'row' },

    // Picker
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
    },
    pickerText: { fontSize: 16, color: '#111827' },

    // Option Buttons (Facility)
    optionGroup: { flexDirection: 'row', gap: 8 },
    optionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    optionSelected: { backgroundColor: '#10B981', borderColor: '#10B981' },
    optionText: { color: '#4B5563', fontSize: 15 },
    optionTextSelected: { color: '#fff', fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '60%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between' },
    modalItemText: { fontSize: 16, color: '#374151' },
    modalCloseButton: { marginTop: 16, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 8, alignItems: 'center' },
    modalCloseText: { color: '#374151', fontWeight: '600' },
});

export default FarmDetailScreen;
