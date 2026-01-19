import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface TextProps extends RNTextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body1' | 'body2' | 'caption' | 'button';
    color?: string;
    weight?: 'regular' | 'medium' | 'bold';
    align?: 'left' | 'center' | 'right';
    style?: TextStyle;
}

export const Text: React.FC<TextProps> = ({
    children,
    variant = 'body1',
    color = colors.text,
    weight,
    align = 'left',
    style,
    ...props
}) => {
    return (
        <RNText
            style={[
                styles.base,
                styles[variant],
                { color, textAlign: align },
                weight && styles[weight],
                style
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
};

const styles = StyleSheet.create({
    base: {
        // fontFamily: 'Pretendard', // 추후 폰트 적용 시 활성화
    },
    h1: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
    h2: { fontSize: 20, fontWeight: 'bold', lineHeight: 28 },
    h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
    body1: { fontSize: 16, lineHeight: 24 },
    body2: { fontSize: 14, lineHeight: 20 },
    caption: { fontSize: 12, lineHeight: 16, color: colors.textSub },
    button: { fontSize: 16, fontWeight: 'bold' },

    // Weights (Overrides if variant doesn't suffice)
    regular: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    bold: { fontWeight: '700' },
});
