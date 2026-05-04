import React from 'react';
import { View, StyleSheet, StatusBar, ViewStyle, SafeAreaView, Platform } from 'react-native';
import { colors } from '../../theme/colors';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  unsafe?: boolean; // If true, disable safe area padding
  barStyle?: 'light-content' | 'dark-content';
  title?: string;
  showBack?: boolean;
  showHeader?: boolean;
  useBottomInset?: boolean;
  headerRight?: React.ReactNode;
  headerCenter?: React.ReactNode; // 가운데 슬롯 — title 대신 컴포넌트 (예: FarmSwitcher)
  showMenu?: boolean; // New prop for hamburger menu
}

import { useNavigation, DrawerActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity, Text } from 'react-native';

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  backgroundColor = colors.background,
  unsafe = false,
  barStyle = 'dark-content',
  title,
  showBack,
  showHeader = true,
  useBottomInset = false,
  showMenu = false,
  headerRight,
  headerCenter,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const Container = View;

  return (
    <Container style={[
      styles.container,
      {
        backgroundColor,
        paddingTop: unsafe ? 0 : insets.top,
        paddingBottom: useBottomInset ? insets.bottom : 0
      }
    ]}>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={backgroundColor === colors.background ? 'transparent' : backgroundColor}
        translucent={true}
      />

      {/* Header */}
      {showHeader && (title || showBack || showMenu || headerRight || headerCenter) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {showBack && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerTitleContainer}>
            {headerCenter ?? (title ? <Text style={styles.headerTitle}>{title}</Text> : null)}
          </View>
          <View style={styles.headerRight}>
            {headerRight}
            {showMenu && (
              <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.menuButton}>
                <Ionicons name="menu-outline" size={28} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={[styles.content, style]}>
        {children}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerRight: {
    minWidth: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  backButton: {
    padding: 4,
  },
  menuButton: {
    padding: 4,
  }
});

export default ScreenWrapper;
