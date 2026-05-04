import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const NoFarmFallback: React.FC<{ message?: string }> = ({ message }) => {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        {message ?? '농장 정보가 없습니다.\n먼저 농장을 등록해주세요.'}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('FarmBasicInfo', { isInitialSetup: false })}
      >
        <Text style={styles.buttonText}>농장 등록하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { fontSize: 16, marginBottom: 24, textAlign: 'center', color: '#333' },
  button: { backgroundColor: '#2e7d32', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

export default NoFarmFallback;
