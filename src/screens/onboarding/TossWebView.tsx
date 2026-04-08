import React from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import authService from '../../services/authService';
import { ONBOARDING } from '../../constants/onboardingTheme';

// react-native-webview is loaded lazily so the app builds even before the
// dependency is installed. After running `expo install react-native-webview`
// the import will resolve at runtime.
let WebView: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WebView = require('react-native-webview').WebView;
} catch (e) {
  WebView = null;
}

interface Props {
  checkoutUrl: string;
  successUrl: string;
  failUrl: string;
  customerKey: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TossWebView({ checkoutUrl, successUrl, failUrl, customerKey, onSuccess, onCancel }: Props) {
  if (!WebView) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>결제창을 표시할 수 없습니다</Text>
        <Text style={styles.fallbackText}>react-native-webview 패키지가 설치되어 있지 않습니다.{'\n'}터미널에서 다음 명령을 실행해주세요:</Text>
        <Text style={styles.cmd}>expo install react-native-webview</Text>
        <TouchableOpacity style={styles.btn} onPress={onCancel}><Text style={styles.btnText}>돌아가기</Text></TouchableOpacity>
      </View>
    );
  }

  const handleNav = async (navState: { url: string }) => {
    const { url } = navState;
    if (!url) return;

    if (url.startsWith(successUrl)) {
      try {
        const params = parseQuery(url);
        const authKey = params.authKey || '';
        const result = await authService.confirmBilling(authKey, customerKey);
        if (result.success) onSuccess();
        else {
          Alert.alert('카드 등록 실패', result.message || '다시 시도해주세요');
          onCancel();
        }
      } catch (e: any) {
        Alert.alert('오류', e?.response?.data?.error || '결제 확인 실패');
        onCancel();
      }
    } else if (url.startsWith(failUrl)) {
      const params = parseQuery(url);
      Alert.alert('카드 등록 실패', params.message || '다시 시도해주세요');
      onCancel();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <WebView
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={handleNav}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}><ActivityIndicator size="large" color={ONBOARDING.colors.primary} /></View>
        )}
        style={{ flex: 1 }}
      />
    </View>
  );
}

function parseQuery(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const q = url.split('?')[1];
  if (!q) return out;
  q.split('&').forEach((pair) => {
    const [k, v] = pair.split('=');
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return out;
}

const styles = StyleSheet.create({
  fallback: { flex: 1, padding: 32, justifyContent: 'center', backgroundColor: ONBOARDING.colors.bg },
  fallbackTitle: { fontSize: 18, fontWeight: '800', color: ONBOARDING.colors.text },
  fallbackText: { fontSize: 14, color: ONBOARDING.colors.textSub, marginTop: 12, lineHeight: 20 },
  cmd: { marginTop: 12, padding: 12, backgroundColor: '#1E1E1E', color: '#A7F3D0', fontFamily: 'Courier', borderRadius: 8 },
  btn: { marginTop: 24, backgroundColor: ONBOARDING.colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});
