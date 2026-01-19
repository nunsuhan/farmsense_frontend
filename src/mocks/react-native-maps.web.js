import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 웹용 MapView 대체 컴포넌트
const MapView = ({ children, style, ...props }) => (
    <View style={[styles.container, style]}>
        <Text style={styles.text}>지도는 모바일 앱에서만 지원됩니다</Text>
        {children}
    </View>
);

const Marker = () => null;
const Callout = () => null;
const Polygon = () => null;
const Polyline = () => null;
const Circle = () => null;
const Overlay = () => null;
const Heatmap = () => null;
const Geojson = () => null;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    text: {
        color: '#666',
        fontSize: 14,
    },
});

export default MapView;
export {
    Marker,
    Callout,
    Polygon,
    Polyline,
    Circle,
    Overlay,
    Heatmap,
    Geojson,
};
