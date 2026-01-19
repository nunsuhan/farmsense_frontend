// src/components/common/BottomTabBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../../theme/colors';

const BottomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  // Filter out 'Menu' so it doesn't appear as a tab button
  const visibleRoutes = state.routes.filter(r => r.name !== 'Menu');

  return (
    <View style={[styles.container, { height: 65 + insets.bottom, paddingBottom: insets.bottom }]}>
      {/* Group 1: First 2 Tabs */}
      {visibleRoutes.slice(0, 2).map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName: any = 'home-outline';
        let label = '홈';

        if (route.name === 'HomeTab') { iconName = isFocused ? 'home' : 'home-outline'; label = '홈'; }
        else if (route.name === 'FarmingLog') { iconName = isFocused ? 'calendar' : 'calendar-outline'; label = '영농일지'; }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Ionicons name={iconName} size={24} color={isFocused ? colors.primary : colors.textDisabled} />
            <Text style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.textDisabled }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}

      {/* Central Camera Tab (Standardized) */}
      <TouchableOpacity
        style={styles.tabButton} // Same style as others
        onPress={() => navigation.navigate('FarmDoctor')}
        accessibilityRole="button"
        accessibilityLabel="팜닥터"
      >
        <Ionicons name="medkit-outline" size={28} color={colors.textDisabled} />
        <Text style={[styles.tabLabel, { color: colors.textDisabled }]}>팜닥터</Text>
      </TouchableOpacity>

      {/* Group 2: Last 2 Tabs */}
      {visibleRoutes.slice(2).map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index + 2;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName: any = 'people-outline';
        let label = '커뮤니티';

        if (route.name === 'Community') { iconName = isFocused ? 'people' : 'people-outline'; label = '커뮤니티'; }
        else if (route.name === 'MyFarm') { iconName = isFocused ? 'leaf' : 'leaf-outline'; label = '내 농장'; }


        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Ionicons name={iconName} size={24} color={isFocused ? colors.primary : colors.textDisabled} />
            <Text style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.textDisabled }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Equal spacing
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    ...shadows.large,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BottomTabBar;

