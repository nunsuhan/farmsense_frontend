import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { ONBOARDING } from '../../constants/onboardingTheme';

interface Props {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}

export default function CodeInput({ value, onChange, length = 6 }: Props) {
  const refs = useRef<Array<TextInput | null>>([]);

  const handleChange = (idx: number, ch: string) => {
    const digit = ch.replace(/[^0-9]/g, '').slice(-1);
    const arr = value.padEnd(length, ' ').split('');
    arr[idx] = digit || ' ';
    const next = arr.join('').replace(/ /g, '').slice(0, length);
    onChange(next);
    if (digit && idx < length - 1) refs.current[idx + 1]?.focus();
  };

  const handleKey = (idx: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => { refs.current[i] = r; }}
          style={styles.box}
          value={value[i] || ''}
          onChangeText={(t) => handleChange(i, t)}
          onKeyPress={(e) => handleKey(i, e)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  box: {
    width: 46, height: 56, borderRadius: ONBOARDING.radius.input,
    borderWidth: 1.5, borderColor: ONBOARDING.colors.border,
    backgroundColor: ONBOARDING.colors.inputBg,
    fontSize: 24, fontWeight: '700', color: ONBOARDING.colors.text,
  },
});
