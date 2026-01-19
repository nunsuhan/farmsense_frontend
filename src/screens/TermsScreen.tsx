// TermsScreen - 이용약관 및 개인정보처리방침
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/common/ScreenWrapper';

type TabType = 'terms' | 'privacy';

const TermsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('terms');

  const renderTermsOfService = () => (
    <ScrollView style={styles.contentScroll}>
      <Text style={styles.documentTitle}>📜 팜센스 이용약관</Text>
      <Text style={styles.updateDate}>최종 수정일: 2025년 1월 1일</Text>

      <View style={styles.article}>
        <Text style={styles.chapterTitle}>제1장 총칙</Text>
        
        <Text style={styles.articleTitle}>제1조 (목적)</Text>
        <Text style={styles.articleContent}>
          본 약관은 팜센스(이하 '회사')가 제공하는 스마트팜 작물 재배 환경 분석 및 
          진단 서비스(이하 '서비스')의 이용 조건 및 절차, 회사와 회원의 권리, 
          의무 및 책임 사항을 규정함을 목적으로 합니다.
        </Text>

        <Text style={styles.articleTitle}>제2조 (용어의 정의)</Text>
        <Text style={styles.articleContent}>
          • <Text style={styles.bold}>'서비스'</Text>: 모바일 앱 '팜센스(포도박사)'를 통해 
          제공되는 AI 기반 작물 생육 진단, 재배 팁 제공, 농가 커뮤니티, 
          IoT 센서 데이터 연동 등의 모든 유·무형 서비스를 말합니다.{'\n\n'}
          • <Text style={styles.bold}>'회원'</Text>: 본 약관에 동의하고 회사와 이용계약을 
          체결하여 서비스를 이용하는 농업인 및 사용자(개인 또는 법인)를 말합니다.{'\n\n'}
          • <Text style={styles.bold}>'진단 데이터'</Text>: 회원이 업로드한 스마트폰 이미지(EXIF 포함), 
          IoT 센서 데이터, 농가 시설 정보 등 서비스를 통해 수집된 모든 데이터를 말합니다.
        </Text>
      </View>

      <View style={styles.article}>
        <Text style={styles.chapterTitle}>제2장 서비스의 이용 및 데이터 관리</Text>

        <Text style={styles.articleTitle}>제5조 (회원의 의무 및 데이터 제공)</Text>
        <Text style={styles.articleContent}>
          • 회원은 서비스 이용 시 정확한 시설 정보, 작기 정보 및 
          사실에 부합하는 이미지를 제공해야 합니다.{'\n\n'}
          • 회원은 주기적으로 작물 사진을 업로드하여 서비스의 
          진단 정확도를 높이는 데 협조해야 합니다.{'\n\n'}
          • 회원은 본 서비스 이용과정에서 얻은 타 회원의 
          개인 정보 및 진단 정보를 외부로 유출하거나 상업적으로 이용해서는 안 됩니다.
        </Text>

        <Text style={styles.articleTitle}>제6조 (진단 데이터의 수집 및 활용)</Text>
        <Text style={styles.articleContent}>
          • 회사는 서비스 운영 및 AI 모델 고도화를 위하여 회원이 제공하는 
          진단 데이터를 수집, 저장 및 이용할 수 있습니다.{'\n\n'}
          • 회사는 수집된 진단 데이터를 개인 식별이 불가능하도록 비식별화하여 
          서비스 개선, AI 모델 학습, 연구 및 통계 목적으로 활용할 수 있습니다.{'\n\n'}
          • 회사는 수집된 진단 데이터와 API를 통해 연동된 정부/공공 데이터를 
          융합하여 서비스에 활용할 수 있습니다.
        </Text>

        <Text style={styles.articleTitle}>제7조 (서비스의 이용 및 제한)</Text>
        <Text style={styles.articleContent}>
          • 회사가 제공하는 재배 팁이나 AI 진단 결과는 
          <Text style={styles.bold}> 데이터 분석을 기반으로 한 참고 정보</Text>이며, 
          최종적인 농작업 결정 및 책임은 전적으로 회원에게 있습니다.{'\n\n'}
          • 회사는 기계적 결함, 오류 등으로 인해 서비스 제공이 일시적으로 중단될 수 있으며, 
          이로 인한 농업적 손실에 대해 원칙적으로 배상 책임을 지지 않습니다.
        </Text>
      </View>

      <View style={styles.article}>
        <Text style={styles.chapterTitle}>제3장 커뮤니티 이용</Text>

        <Text style={styles.articleTitle}>제10조 (커뮤니티 활동)</Text>
        <Text style={styles.articleContent}>
          • 회원은 커뮤니티에서 다른 회원을 존중하며, 비방, 욕설, 허위 사실 유포, 
          상업적 광고 행위 등 서비스의 건전성을 해치는 행위를 할 수 없습니다.{'\n\n'}
          • 커뮤니티에 게시된 정보(진단 후기, 재배 팁 등)의 정확성 및 
          법적 책임은 해당 게시물을 작성한 회원에게 있습니다.
        </Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );

  const renderPrivacyPolicy = () => (
    <ScrollView style={styles.contentScroll}>
      <Text style={styles.documentTitle}>🛡️ 개인정보처리방침</Text>
      <Text style={styles.updateDate}>최종 수정일: 2025년 1월 1일</Text>

      <View style={styles.article}>
        <Text style={styles.articleTitle}>제1조 (개인정보의 수집 및 이용 목적)</Text>
        <Text style={styles.articleContent}>
          회사는 다음 목적을 위해 개인정보를 처리합니다. 처리하고 있는 개인정보는 
          다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 
          별도의 동의를 받습니다.{'\n\n'}
          <Text style={styles.bold}>1. 회원 가입 및 관리</Text>{'\n'}
          본인 식별, 불량 회원의 부정이용 방지, 작물별 AI 진단 서비스 제공{'\n\n'}
          <Text style={styles.bold}>2. 서비스 제공 및 기능 구현</Text>{'\n'}
          AI 진단 결과 및 재배 팁 제공, 알림(Alert) 기능 제공{'\n\n'}
          <Text style={styles.bold}>3. 데이터 융합 및 AI 모델 고도화</Text>{'\n'}
          비식별화된 형태로 작물 진단 데이터와 연동하여 서비스 품질 개선 및 연구 개발에 활용
        </Text>
      </View>

      <View style={styles.article}>
        <Text style={styles.articleTitle}>제2조 (수집하는 개인정보의 항목)</Text>
        <Text style={styles.articleContent}>
          회사는 서비스 제공을 위해 다음 항목의 개인정보를 수집합니다.{'\n\n'}
          <Text style={styles.bold}>1. 회원 가입 시</Text>{'\n'}
          이름, 연락처(전화번호), 이메일 주소, 비밀번호{'\n\n'}
          <Text style={styles.bold}>2. 시설 연동 시</Text>{'\n'}
          시설 ID, 작기 일련번호, 수령 및 대목 정보, 재배 품종{'\n\n'}
          <Text style={styles.bold}>3. 서비스 이용 시 (자동 수집)</Text>{'\n'}
          • GPS 정보: 스마트폰 카메라 촬영 시 및 IoT 센서 위치 연동을 위한 위치 정보{'\n'}
          • 이용 기록: 접속 일시, 서비스 이용 기록, IP 주소{'\n'}
          • 이미지 EXIF 데이터: 촬영 일시, 기기 정보
        </Text>
      </View>

      <View style={styles.article}>
        <Text style={styles.articleTitle}>제3조 (개인정보의 처리 및 보유 기간)</Text>
        <Text style={styles.articleContent}>
          회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 
          수집 시에 동의 받은 개인정보 보유·이용 기간 내에서 개인정보를 처리 및 보유합니다.{'\n\n'}
          <Text style={styles.bold}>보유 기간:</Text> 원칙적으로 회원 탈퇴 시 지체 없이 파기합니다. 
          단, 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 해당 법령이 정한 기간 동안 보존합니다.
        </Text>
      </View>

      <View style={styles.article}>
        <Text style={styles.articleTitle}>제4조 (개인정보의 파기 절차 및 방법)</Text>
        <Text style={styles.articleContent}>
          <Text style={styles.bold}>파기 절차:</Text> 회사는 보유 기간이 경과하거나 이용 목적이 
          달성된 후, 해당 정보를 별도의 DB로 옮겨 관계 법령에 따라 일정 기간 저장 후 파기합니다.{'\n\n'}
          <Text style={styles.bold}>파기 방법:</Text> 전자적 파일 형태의 정보는 복구 및 재생이 
          불가능한 기술적 방법(로우레벨 포맷 등)을 사용하여 삭제합니다.
        </Text>
      </View>

      <View style={styles.article}>
        <Text style={styles.articleTitle}>제5조 (개인정보의 안전성 확보 조치)</Text>
        <Text style={styles.articleContent}>
          회사는 개인정보의 안전성 확보를 위해 기술적·관리적 및 물리적 조치를 취하고 있습니다.{'\n\n'}
          <Text style={styles.bold}>• 기술적 대책:</Text> 개인정보처리시스템 접근 통제, 암호화 통신, 
          해킹 및 악성코드 방지 시스템 운영 등{'\n\n'}
          <Text style={styles.bold}>• 관리적 대책:</Text> 개인정보 취급 직원의 교육 및 최소화, 
          정기적인 자체 감사 실시 등{'\n\n'}
          <Text style={styles.bold}>• 비식별화 조치:</Text> AI 모델 학습 등 연구 목적으로 
          진단 데이터를 활용할 경우, 개인 식별 정보를 삭제하거나 암호화하는 등 비식별화하여 처리합니다.
        </Text>
      </View>

      <View style={styles.article}>
        <Text style={styles.articleTitle}>제6조 (개인정보 보호책임자)</Text>
        <Text style={styles.articleContent}>
          회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 
          개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 
          아래와 같이 개인정보 보호책임자를 지정하고 있습니다.{'\n\n'}
          <Text style={styles.bold}>개인정보 보호책임자</Text>{'\n'}
          문의: support@farmsense.kr
        </Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );

  return (
    <ScreenWrapper title="약관 및 정책">
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'terms' && styles.tabButtonActive]}
          onPress={() => setActiveTab('terms')}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
            이용약관
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'privacy' && styles.tabButtonActive]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
            개인정보처리방침
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'terms' ? renderTermsOfService() : renderPrivacyPolicy()}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: 'white',
  },
  contentScroll: {
    flex: 1,
    padding: 16,
  },
  documentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  updateDate: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  article: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#D1FAE5',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  articleContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 24,
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  spacer: {
    height: 40,
  },
});

export default TermsScreen;
