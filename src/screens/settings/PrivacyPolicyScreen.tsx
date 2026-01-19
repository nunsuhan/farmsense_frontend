// src/screens/settings/PrivacyPolicyScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';

const PrivacyPolicyScreen: React.FC = () => {
    return (
        <ScreenWrapper title="개인정보처리방침" showBack showMenu={true}>
            <ScrollView style={styles.content}>
                <Text style={styles.title}>개인정보처리방침</Text>
                <Text style={styles.date}>시행일: 2024년 12월 29일</Text>

                <View style={styles.section}>
                    <Text style={styles.heading}>1. 개인정보의 처리 목적</Text>
                    <Text style={styles.text}>
                        FarmSense(이하 '회사')는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                    </Text>
                    <Text style={styles.listItem}>1. 회원 가입 및 관리</Text>
                    <Text style={styles.listItem}>2. 서비스 제공 (병해 진단, 농장 관리 등)</Text>
                    <Text style={styles.listItem}>3. 마케팅 및 광고에의 활용</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>2. 개인정보의 처리 및 보유 기간</Text>
                    <Text style={styles.text}>
                        회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                    </Text>
                    <Text style={styles.listItem}>- 회원 탈퇴 시까지</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>3. 처리하는 개인정보의 항목</Text>
                    <Text style={styles.text}>회사는 다음의 개인정보 항목을 처리하고 있습니다.</Text>
                    <Text style={styles.listItem}>- 필수항목: 이름, 이메일, 휴대전화번호, 농장 정보(위치, 작물 등)</Text>
                    <Text style={styles.listItem}>- 선택항목: 프로필 사진, 영농 경력</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>4. 개인정보의 파기</Text>
                    <Text style={styles.text}>
                        회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>5. 개인정보 보호책임자</Text>
                    <Text style={styles.text}>
                        회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                    </Text>
                    <Text style={styles.listItem}>- 성명: 관리자</Text>
                    <Text style={styles.listItem}>- 연락처: help@farmsense.kr</Text>
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
    listItem: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginLeft: 8 },
});

export default PrivacyPolicyScreen;
