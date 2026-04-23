// src/screens/settings/TermsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';

const TermsScreen: React.FC = () => {
    return (
        <ScreenWrapper title="이용약관" showBack showMenu={false}>
            <ScrollView style={styles.content}>
                <Text style={styles.title}>서비스 이용약관</Text>
                <Text style={styles.date}>시행일: 2024년 12월 29일</Text>

                <View style={styles.section}>
                    <Text style={styles.heading}>제1조 (목적)</Text>
                    <Text style={styles.text}>
                        이 약관은 FarmSense(이하 "회사")가 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>제2조 (용어의 정의)</Text>
                    <Text style={styles.listItem}>1. "서비스"라 함은 구현되는 단말기와 상관없이 회원이 이용할 수 있는 FarmSense 및 관련 제반 서비스를 의미합니다.</Text>
                    <Text style={styles.listItem}>2. "회원"이라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>제3조 (약관의 게시와 개정)</Text>
                    <Text style={styles.text}>
                        회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 "약관의 규제에 관한 법률" 등 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>제4조 (서비스의 제공 및 변경)</Text>
                    <Text style={styles.text}>
                        회사는 회원에게 아래와 같은 서비스를 제공합니다.
                    </Text>
                    <Text style={styles.listItem}>1. AI 병해 진단 서비스</Text>
                    <Text style={styles.listItem}>2. 농장 환경 모니터링 및 제어 서비스</Text>
                    <Text style={styles.listItem}>3. 영농일지 및 커뮤니티 서비스</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>제5조 (서비스 요금 정책)</Text>
                    <Text style={styles.listItem}>1. 현재 본 서비스는 모든 기능을 무료로 제공합니다.</Text>
                    <Text style={styles.listItem}>2. 향후 일부 기능을 유료 구독으로 전환할 수 있으며, 이 경우 전환 예정일로부터 최소 30일 이전에 다음 방법으로 사전 통지합니다:</Text>
                    <Text style={[styles.listItem, { marginLeft: 20 }]}>가. 앱 내 공지사항 배너</Text>
                    <Text style={[styles.listItem, { marginLeft: 20 }]}>나. 가입 시 등록된 이메일</Text>
                    <Text style={[styles.listItem, { marginLeft: 20 }]}>다. 카카오톡 알림 (동의한 경우)</Text>
                    <Text style={styles.listItem}>3. 유료 전환 이전 가입자에 대해서는 별도의 혜택을 제공할 수 있습니다.</Text>
                    <Text style={styles.listItem}>4. 무료 사용 기간 동안 축적된 사용자 데이터(영농일지, 사진, 진단 기록 등)는 유료 전환 여부와 무관하게 계속 접근 가능합니다.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>제6조 (책임 제한)</Text>
                    <Text style={styles.text}>
                        회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다. 또한, AI 진단 결과는 참고용이며, 이에 대한 최종 판단 및 책임은 사용자에게 있습니다.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    content: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
    date: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
    section: { marginBottom: 24 },
    heading: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
    text: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 8 },
    listItem: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginLeft: 8, marginBottom: 4 },
});

export default TermsScreen;
