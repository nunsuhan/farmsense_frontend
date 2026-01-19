import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { diagnosisApi } from '../../services/diagnosisApi';
import { useNavigation } from '@react-navigation/native';

const DiagnosisHistoryScreen = () => {
    const [diagnoses, setDiagnoses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const fetchHistory = async () => {
        setLoading(true);
        try {
            // Fetching page 1 only for now
            const res = await diagnosisApi.getDiagnoses(1, 20);
            if (res && res.results) {
                setDiagnoses(res.results);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DiagnosisResult', {
                result: {
                    // Convert API specific structure to DiagnosisResult unified structure if needed
                    // Mocking the structure expected by DiagnosisResult or passing raw
                    ...item,
                    visual_diagnosis: item.result_data // Assuming API structure
                },
                imageUri: item.image_url
            })}
        >
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <Text style={styles.disease}>
                    {item.result_data?.disease_name || item.disease_name || '진단 결과'}
                </Text>
                <Text style={styles.confidence}>
                    신뢰도: {Math.round((item.result_data?.confidence || item.confidence || 0) * 100)}%
                </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.is_safe ? '#D1FAE5' : '#FEE2E2' }]}>
                <Text style={[styles.statusText, { color: item.is_safe ? '#059669' : '#DC2626' }]}>
                    {item.is_safe ? '정상' : '병해'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper title="진단 이력" showBack={true}>
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={diagnoses}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={styles.empty}>진단 이력이 없습니다.</Text>}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    list: { padding: 16 },
    card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 1 },
    image: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#E5E7EB' },
    info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    date: { fontSize: 12, color: '#9CA3AF' },
    disease: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 2 },
    confidence: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    statusBadge: { justifyContent: 'center', paddingHorizontal: 10, borderRadius: 20, height: 26, alignSelf: 'center' },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    empty: { textAlign: 'center', marginTop: 50, color: '#9CA3AF' }
});

export default DiagnosisHistoryScreen;
