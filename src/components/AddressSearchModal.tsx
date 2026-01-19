import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../services/api';

interface Address {
  roadAddr: string;          // 도로명주소
  jibunAddr: string;         // 지번주소
  zipNo: string;             // 우편번호
  admCd: string;             // 행정구역코드
  bdNm: string;              // 건물명
  detBdNmList?: string;      // 상세건물명
}

interface AddressSearchProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: Address) => void;
}

// 도로명주소 API 가이드 기준 검색어 검증 함수
const checkSearchedWord = (keyword: string): { valid: boolean; message?: string } => {
  if (!keyword || keyword.trim().length === 0) {
    return { valid: false, message: '검색어를 입력해주세요.' };
  }

  // 1. 특수문자 제거 (%, =, >, <, [, ])
  const specialCharRegex = /[%=><\[\]]/;
  if (specialCharRegex.test(keyword)) {
    return { valid: false, message: '특수문자(%,=,>,<,[,])는 입력할 수 없습니다.' };
  }

  // 2. SQL 예약어 제거 (대소문자 구분 없이)
  const sqlKeywords = [
    'OR', 'SELECT', 'INSERT', 'DELETE', 'UPDATE',
    'CREATE', 'DROP', 'EXEC', 'UNION',
    'FETCH', 'DECLARE', 'TRUNCATE'
  ];

  for (const sqlKeyword of sqlKeywords) {
    const regex = new RegExp(`\\b${sqlKeyword}\\b`, 'gi');
    if (regex.test(keyword)) {
      return {
        valid: false,
        message: `"${sqlKeyword}"와(과) 같은 특정문자로 검색할 수 없습니다.`
      };
    }
  }

  // 3. 한글자 이상 입력 체크
  if (keyword.trim().length < 2) {
    return { valid: false, message: '검색어는 두 글자 이상 입력해주세요.' };
  }

  // 4. 검색어 길이 체크 (한글 40자, 영문/숫자 80자)
  const koreanLength = (keyword.match(/[ㄱ-ㅎ가-힣]/g) || []).length;
  const otherLength = keyword.length - koreanLength;

  if (koreanLength > 40 || otherLength > 80) {
    return { valid: false, message: '검색어가 너무 깁니다. (한글 40자, 영문/숫자 80자 이하)' };
  }

  return { valid: true };
};

const AddressSearchModal: React.FC<AddressSearchProps> = ({
  visible,
  onClose,
  onSelectAddress,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const searchAddress = async (page: number = 1) => {
    // 검색어 검증 (도로명주소 API 가이드 기준)
    const validation = checkSearchedWord(searchKeyword);
    if (!validation.valid) {
      Alert.alert('알림', validation.message || '검색어를 확인해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Django 백엔드를 통해 안전하게 호출 (apiClient 사용)
      // baseURL에 이미 /api 포함되어 있음. 2026-01-18 엔드포인트 수정 (/public/address/ -> /public/juso/)
      const response = await apiClient.get('/public/juso/', {
        params: {
          query: searchKeyword,
          currentPage: page,
          countPerPage: 10,
        },
      });

      // ✅ 디버깅: 실제 응답 확인
      console.log('🔍 [주소검색] API 응답:', JSON.stringify(response.data, null, 2));

      const data = response.data;

      if (!data || !data.success) {
        console.error('❌ [주소검색] 실패:', data);
        throw new Error(data?.message || '주소 검색에 실패했습니다.');
      }

      const items = data.items || [];
      console.log('📋 [주소검색] 주소 개수:', items.length);

      // API 응답 형식을 내부 Address 인터페이스로 매핑
      const mappedAddresses: Address[] = items.map((item: any) => ({
        roadAddr: item.road_address,
        jibunAddr: item.jibun_address,
        zipNo: item.zip_code,
        admCd: '', // API에서 제공하지 않음, 필요하다면 추가 로직 필요
        bdNm: item.building_name,
        detBdNmList: ''
      }));

      setAddresses(mappedAddresses);
      setTotalCount(data.total_count || 0);
      setCurrentPage(page);

      console.log('✅ [주소검색] 성공: ' + mappedAddresses.length + '개');
    } catch (error: any) {
      console.error('❌ [주소검색] 오류:', error);
      console.error('❌ [주소검색] 상태코드:', error.response?.status);
      console.error('❌ [주소검색] 응답 데이터:', error.response?.data);
      console.error('❌ [주소검색] 에러 메시지:', error.message);

      if (error.response?.status === 401) {
        Alert.alert('인증 필요', '로그인이 필요한 서비스입니다.');
      } else if (error.response?.status === 500) {
        Alert.alert('서버 오류', error.response.data?.error || '주소 검색 중 오류가 발생했습니다.');
      } else if (error.message) {
        Alert.alert('검색 실패', error.message);
      } else {
        Alert.alert('검색 실패', '주소 검색 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAddress = (address: Address) => {
    onSelectAddress(address);
    onClose();
    resetSearch();
  };

  const resetSearch = () => {
    setSearchKeyword('');
    setAddresses([]);
    setCurrentPage(1);
    setTotalCount(0);
  };

  const handleClose = () => {
    onClose();
    resetSearch();
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <TouchableOpacity
      style={styles.addressItem}
      onPress={() => handleSelectAddress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.addressHeader}>
        <View style={styles.zipCodeBadge}>
          <Text style={styles.zipCodeText}>{item.zipNo}</Text>
        </View>
        {item.bdNm && (
          <Text style={styles.buildingName}>{item.bdNm}</Text>
        )}
      </View>
      <Text style={styles.roadAddress}>{item.roadAddr}</Text>
      <Text style={styles.jibunAddress}>지번: {item.jibunAddr}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>주소 검색</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* 검색 입력 */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              placeholder="도로명, 건물명, 지번을 입력하세요"
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              onSubmitEditing={() => {
                Keyboard.dismiss();
                searchAddress(1);
              }}
            />
            {searchKeyword.length > 0 && (
              <TouchableOpacity onPress={() => setSearchKeyword('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              // 키보드 먼저 닫고 약간 딜레이 후 검색 실행
              Keyboard.dismiss();
              setTimeout(() => searchAddress(1), 100);
            }}
            disabled={isLoading}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.searchButtonText}>검색</Text>
          </TouchableOpacity>
        </View>

        {/* 검색 안내 */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#3B82F6" />
          <Text style={styles.infoText}>
            도로명, 건물명 또는 지번으로 검색하세요. 예: "테헤란로 152", "강남역"
          </Text>
        </View>

        {/* 검색 결과 */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>주소 검색 중...</Text>
          </View>
        ) : addresses.length > 0 ? (
          <>
            <View style={styles.resultHeader}>
              <Text style={styles.resultCount}>
                총 {totalCount.toLocaleString()}건
              </Text>
              {totalCount > 10 && (
                <Text style={styles.resultHint}>
                  (상위 {addresses.length}개 표시)
                </Text>
              )}
            </View>

            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={(item, index) => `${item.zipNo}-${index}`}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />

            {/* 페이지네이션 */}
            {totalCount > 10 && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                  onPress={() => searchAddress(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#D1D5DB' : '#1F2937'} />
                </TouchableOpacity>

                <Text style={styles.pageText}>
                  {currentPage} / {Math.ceil(totalCount / 10)}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    currentPage >= Math.ceil(totalCount / 10) && styles.pageButtonDisabled,
                  ]}
                  onPress={() => searchAddress(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalCount / 10) || isLoading}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={currentPage >= Math.ceil(totalCount / 10) ? '#D1D5DB' : '#1F2937'}
                  />
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {searchKeyword ? '검색 결과가 없습니다' : '주소를 검색해보세요'}
            </Text>
            <Text style={styles.emptySubtext}>
              도로명, 건물명, 지번으로 검색 가능합니다
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  searchButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    marginLeft: 8,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultHint: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addressItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  zipCodeBadge: {
    backgroundColor: '#10B981',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  zipCodeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buildingName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  roadAddress: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  jibunAddress: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pageButton: {
    padding: 8,
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginHorizontal: 24,
  },
});

export default AddressSearchModal;

