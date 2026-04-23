import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    Alert,
    Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import * as ImagePicker from 'expo-image-picker';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { createFieldBookEntry, ImageAnalysisResult } from '../../services/fieldBookApi';
import { useStore } from '../../store/useStore';

export const LogWriteScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [date] = useState(new Date());
    const [images, setImages] = useState<string[]>([]);
    const [memo, setMemo] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [partialText, setPartialText] = useState('');
    const [saving, setSaving] = useState(false);
    const farmInfo = useStore((s) => s.farmInfo) as any;

    const formatBbch = (code: number | null, korean: string) => {
        if (code == null) return '미지정';
        return `BBCH ${code}${korean ? ' · ' + korean : ''}`;
    };

    const handleSave = async () => {
        if (!memo.trim() && images.length === 0) {
            Alert.alert('알림', '작업 내용이나 사진을 추가해 주세요.');
            return;
        }
        setSaving(true);
        try {
            const res = await createFieldBookEntry({
                intervention_type: route.params?.receiptOCR ? 'other' : (images.length > 0 ? 'other' : 'other'),
                intervention_date: date.toISOString().slice(0, 10),
                details: route.params?.receiptOCR ? { receipt_ocr: route.params.receiptOCR } : {},
                notes: memo.trim(),
                farm_id: farmInfo?.id,
                photos: images,
            });

            const analysisMessages: string[] = [];
            (res.analysis_results || []).forEach((a: ImageAnalysisResult) => {
                if (a.error) {
                    analysisMessages.push(`• 분석 실패: ${a.error}`);
                    return;
                }
                const bbch = formatBbch(a.gdd_bbch, a.gdd_bbch_korean);
                const disease = a.disease_local && a.disease_local !== '00_normal'
                    ? `이상 소견: ${a.disease_local} (신뢰도 ${Math.round((a.disease_confidence || 0) * 100)}%)`
                    : '정상';
                analysisMessages.push(`• 발달단계: ${bbch}\n  ${disease}`);
                (a.warnings || []).forEach((w) => analysisMessages.push(`  ⚠ ${w}`));
            });

            const body = analysisMessages.length
                ? `영농일지가 저장되었습니다.\n\n[자동 분석]\n${analysisMessages.join('\n')}`
                : '영농일지가 저장되었습니다.';
            Alert.alert('저장 완료', body, [
                { text: '확인', onPress: () => navigation.goBack() },
            ]);
        } catch (e: any) {
            const msg = e?.response?.data?.error || e?.message || '저장 실패';
            Alert.alert('오류', msg);
        } finally {
            setSaving(false);
        }
    };

    // 영수증 OCR 결과 prefill (ReceiptOCRScreen에서 전달)
    useEffect(() => {
        const ocr = route.params?.receiptOCR;
        if (!ocr) return;
        const lines: string[] = [];
        if (ocr.shop_name) lines.push(`[상점] ${ocr.shop_name}`);
        if (ocr.date) lines.push(`[영수증 날짜] ${ocr.date}`);
        if (ocr.total_amount !== undefined) {
            lines.push(`[총액] ${Number(ocr.total_amount).toLocaleString()}원`);
        }
        if (Array.isArray(ocr.items) && ocr.items.length > 0) {
            lines.push('[품목]');
            ocr.items.forEach((it: any) => {
                const parts = [
                    it.name,
                    it.quantity,
                    it.price !== undefined ? `${Number(it.price).toLocaleString()}원` : undefined,
                ].filter(Boolean);
                lines.push(`- ${parts.join(' · ')}`);
            });
        }
        if (lines.length > 0) {
            setMemo((prev) => (prev ? prev + '\n\n' : '') + lines.join('\n'));
        }
    }, [route.params?.receiptOCR]);

    useEffect(() => {
        Voice.onSpeechStart = () => {
            setIsListening(true);
            setPartialText('');
        };
        Voice.onSpeechEnd = () => {
            setIsListening(false);
            setPartialText('');
        };

        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
            if (e.value && e.value.length > 0) {
                const text = e.value[0];
                setMemo((prev) => (prev ? prev + ' ' : '') + text);
                setPartialText(''); // 확정되었으므로 임시 텍스트 초기화
            }
        };

        Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
            if (e.value && e.value.length > 0) {
                setPartialText(e.value[0]);
            }
        };

        Voice.onSpeechError = (e: SpeechErrorEvent) => {
            setIsListening(false);
            setPartialText(''); // 에러 발생 시 임시 텍스트 제거

            const errorCode = e.error?.code;
            const errorMessage = e.error?.message;
            console.log('Speech Error:', e.error);

            // 에러 코드 7 (No match) or 11 (Recognizer busy/fail)
            if (errorCode === '7' || errorMessage?.includes('No match')) {
                // 그냥 종료 (아무 기능 안함)
            } else if (errorCode === '11') {
                Alert.alert('알림', '음성을 인식하지 못했습니다. 다시 시도해주세요.');
            } else {
                // 그 외 에러
                console.error(e.error);
            }
        };

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const toggleListening = async () => {
        try {
            if (isListening) {
                await Voice.stop();
                setIsListening(false);
            } else {
                Keyboard.dismiss(); // 자판 내리기 추가
                await Voice.destroy();
                setPartialText('');
                // 기존 텍스트가 있고 공백으로 끝나지 않으면 공백 추가 (UX)
                // setMemo에서 처리하므로 여기선 패스, 혹은 시작시 처리
                await Voice.start('ko-KR');
                setIsListening(true);
            }
        } catch (e) {
            console.error(e);
            setIsListening(false);
            Alert.alert('오류', '음성 인식을 시작할 수 없습니다. 권한을 확인해주세요.');
        }
    };

    const pickImage = async () => {
        if (images.length >= 5) {
            Alert.alert('알림', '사진은 최대 5장까지 첨부 가능합니다.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: 5 - images.length,
        });

        if (!result.canceled && result.assets) {
            const newUris = result.assets.map(asset => asset.uri);
            setImages([...images, ...newUris]);
        }
    };

    return (
        <ScreenWrapper title="영농일지 작성" showBack={true}>
            <View style={styles.container}>
                {/* Date Display */}
                <Text style={styles.dateText}>
                    {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일 ({['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})
                </Text>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Action Buttons Row */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.voiceBtn, isListening && styles.voiceBtnActive]}
                            onPress={toggleListening}
                        >
                            <Ionicons name={isListening ? "radio-outline" : "mic-outline"} size={20} color="white" />
                            <Text style={styles.actionBtnText}>{isListening ? '듣는 중...' : '음성입력'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, styles.photoBtn]} onPress={pickImage}>
                            <Ionicons name="camera-outline" size={20} color="white" />
                            <Text style={styles.actionBtnText}>사진 ({images.length}/5)</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Memo Input */}
                    <TextInput
                        style={styles.memoInput}
                        multiline
                        placeholder="오늘의 작업 내용을 자유롭게 기록하세요..."
                        placeholderTextColor="#9CA3AF"
                        textAlignVertical="top"
                        value={isListening ? (memo + (memo && !memo.endsWith(' ') ? ' ' : '') + partialText) : memo}
                        onChangeText={setMemo}
                        autoFocus
                    />

                    {/* Photo Preview */}
                    {images.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoPreview}>
                            {images.map((uri, idx) => (
                                <View key={idx} style={styles.photoItem}>
                                    <Image source={{ uri }} style={styles.photoThumb} />
                                    <TouchableOpacity
                                        style={styles.removePhoto}
                                        onPress={() => setImages(images.filter((_, i) => i !== idx))}
                                    >
                                        <Ionicons name="close" size={12} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveText}>💾 저장하기</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F9FAFB',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 20,
        textAlign: 'center',
    },
    mainContent: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        elevation: 2,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    voiceBtn: {
        backgroundColor: '#F59E0B',
    },
    voiceBtnActive: {
        backgroundColor: '#EF4444',
    },
    photoBtn: {
        backgroundColor: '#3B82F6',
    },
    actionBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    memoInput: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1F2937',
        lineHeight: 24,
    },
    photoPreview: {
        marginTop: 12,
        maxHeight: 80,
    },
    photoItem: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 8,
        position: 'relative',
    },
    photoThumb: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removePhoto: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    saveBtn: {
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        elevation: 3,
    },
    saveText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LogWriteScreen;
