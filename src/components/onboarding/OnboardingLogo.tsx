import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ONBOARDING } from '../../constants/onboardingTheme';

export default function OnboardingLogo() {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>FS</Text>
      </View>
      <View>
        <Text style={styles.brand}>FarmSense</Text>
        <Text style={styles.tagline}>AI 스마트 농업 의사결정</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: ONBOARDING.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  brand: { fontSize: 20, fontWeight: '800', color: ONBOARDING.colors.text },
  tagline: { fontSize: 12, color: ONBOARDING.colors.textSub, marginTop: 2 },
});
