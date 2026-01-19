// src/screens/settings/SupportScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';

const SupportScreen: React.FC = () => {
    const navigation = useNavigation();

    // Form State
    const [category, setCategory] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [farm, setFarm] = useState('');
    const [message, setMessage] = useState('');
    const [agreed, setAgreed] = useState(false);

    // UI State
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const categories = [
        '사용법 문의',
        '오류/버그 신고',
        '기능 제안',
        '조합/단체 도입',
        '파트너십 문의',
        '기타',
    ];

    const handleSubmit = async () => {
        if (!category || !name || !email || !message) {
            Alert.alert('알림', '필수 항목(*)을 모두 입력해주세요.');
            return;
        }
        if (!agreed) {
            Alert.alert('알림', '개인정보 수집 및 이용에 동의해주세요.');
            return;
        }

        setLoading(true);

        const formData = {
            _subject: `[FarmSense] 문의 - ${category}`, // Formspree subject
            category,
            name,
            phone,
            email,
            farm,
            message,
        };

        try {
            const response = await fetch('https://formspree.io/f/xvgelwkv', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                Alert.alert('오류', '문의 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            Alert.alert('오류', '네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <ScreenWrapper title="오류 신고" showBack showMenu={true}>
                <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                    <Text style={styles.successTitle}>문의가 접수되었습니다</Text>
                    <Text style={styles.successSubtitle}>1-2일 내에 등록하신 이메일로 답변드리겠습니다.</Text>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.submitButtonText}>확인</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper title="오류 신고" showBack showMenu={true}>
            <View style={{ flex: 1 }}>
                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Text style={styles.description}>빠른 답변을 위해 상세 내용을 적어주세요.</Text>

                    {/* Category Select */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>문의 유형 <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
                            <Text style={[styles.selectText, !category && styles.placeholderText]}>
                                {category || '선택해주세요'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {/* Name & Phone */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>이름 <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="입력"
                                placeholderTextColor="#D1D5DB"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>연락처</Text>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="입력"
                                keyboardType="phone-pad"
                                placeholderTextColor="#D1D5DB"
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>이메일 <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="example@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#D1D5DB"
                        />
                    </View>

                    {/* Farm Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>농장명</Text>
                        <TextInput
                            style={styles.input}
                            value={farm}
                            onChangeText={setFarm}
                            placeholder="농장 이름"
                            placeholderTextColor="#D1D5DB"
                        />
                    </View>

                    {/* Message */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>문의 내용 <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="문의하실 내용을 자세히 적어주세요."
                            placeholderTextColor="#D1D5DB"
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Agreement */}
                    <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreed(!agreed)}>
                        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                            {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                        <Text style={styles.checkboxLabel}>개인정보 수집 및 이용에 동의합니다</Text>
                    </TouchableOpacity>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>문의하기</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>

                {/* Category Modal */}
                <Modal visible={modalVisible} transparent animationType="fade">
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>문의 유형 선택</Text>
                            <FlatList
                                data={categories}
                                keyExtractor={item => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setCategory(item);
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.modalItemText,
                                            category === item && { color: '#10B981', fontWeight: 'bold' }
                                        ]}>{item}</Text>
                                        {category === item && (
                                            <Ionicons name="checkmark" size={20} color="#10B981" />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    // header styles are no longer needed
    content: { flex: 1, padding: 20 },
    description: { color: '#6B7280', marginBottom: 24, fontSize: 14 },

    inputGroup: { marginBottom: 16 },
    row: { flexDirection: 'row' },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    required: { color: '#EF4444' },

    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12, // Adjusted for better height
        fontSize: 15,
        color: '#111827',
    },
    textArea: { height: 120 },

    selectButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    selectText: { fontSize: 15, color: '#111827' },
    placeholderText: { color: '#D1D5DB' },

    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 24 },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    checkboxChecked: { backgroundColor: '#10B981', borderColor: '#10B981' },
    checkboxLabel: { color: '#4B5563', fontSize: 14 },

    submitButton: {
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    submitButtonDisabled: { backgroundColor: '#A7F3D0' },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // Success Screen
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, marginTop: -60 },
    successTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 16, marginBottom: 8 },
    successSubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: '60%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalItemText: { fontSize: 16, color: '#374151' },
});

export default SupportScreen;
