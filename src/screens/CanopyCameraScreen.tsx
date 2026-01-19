// CanopyCameraScreen - Component Stubbed for Expo Migration
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { Camera } from 'react-native-vision-camera'; 
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Text } from '../components/common/Text';
import { colors } from '../theme/colors';

const CanopyCameraScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <ScreenWrapper backgroundColor="black">
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 20 }}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <Text variant="h3" color="white" style={{ textAlign: 'center', marginTop: 100 }}>
          Canopy Analysis
        </Text>
        <Text variant="body1" color="gray" style={{ textAlign: 'center', marginTop: 20 }}>
          Camera functionality is being migrated to Expo Camera.
        </Text>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});

export default CanopyCameraScreen;





