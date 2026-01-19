import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_NOTI = '@farmsense_notifications';

const AlertSettingsScreen = () => {
  const [settings, setSettings] = useState({
    pestAlert: true,      // 병해충 경보
    diaryReminder: true,  // 영농일지 알림
    marketing: false,     // 마케팅 정보
    community: true,      // 커뮤니티 알림
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_NOTI);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSwitch = async (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_NOTI, JSON.stringify(newSettings));
    } catch (e) {
      Alert.alert('오류', '설정을 저장하지 못했습니다.');
    }
  };

  const renderItem = (label: string, description: string, key: string) => (
    <View style={styles.item}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        trackColor={{ false: '#D1D5DB', true: '#10B981' }}
        thumbColor={settings[key as keyof typeof settings] ? '#FFFFFF' : '#F3F4F6'}
        onValueChange={() => toggleSwitch(key)}
        value={settings[key as keyof typeof settings]}
      />
    </View>
  );

  return (
    <ScreenWrapper title="알림 설정" showBack={true} showMenu={true}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>필수 알림</Text>
          {renderItem('병해충 주의보', '내 지역의 병해충 발생 정보를 즉시 알려줍니다.', 'pestAlert')}
          {renderItem('영농일지 리마인더', '매일 저녁 영농일지 작성을 잊지 않게 알려줍니다.', 'diaryReminder')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>선택 알림</Text>
          {renderItem('커뮤니티 활동', '내 글에 댓글이 달리면 알려줍니다.', 'community')}
          {renderItem('마케팅 정보', '이벤트 및 프로모션 소식을 받습니다.', 'marketing')}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default AlertSettingsScreen;


