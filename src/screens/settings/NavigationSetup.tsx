// @ts-nocheck
// ✅ App.tsx 또는 MainNavigator.tsx에 추가할 화면들

import SettingsMainScreen from './src/screens/settings/SettingsMainScreen';
import FarmBasicInfoScreen from './src/screens/settings/FarmBasicInfoScreen';
import SensorRegistrationScreen from './src/screens/settings/SensorRegistrationScreen';
import NotificationSettingsScreen from './src/screens/settings/NotificationSettingsScreen';
import AccountSettingsScreen from './src/screens/settings/AccountSettingsScreen';

// ✅ Stack Navigator 설정 예시
const SettingsStack = createStackNavigator();

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false, // 각 화면에서 자체 헤더 사용
      }}
    >
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsMainScreen}
      />
      <SettingsStack.Screen
        name="FarmBasicInfo"
        component={FarmBasicInfoScreen}
      />
      <SettingsStack.Screen
        name="SensorRegistration"
        component={SensorRegistrationScreen}
      />
      <SettingsStack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
      <SettingsStack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
      />
    </SettingsStack.Navigator>
  );
}

// ✅ Tab Navigator에 추가
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      {/* 기존 탭들 */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* ... 다른 탭들 ... */}

      {/* ✅ 설정 탭 추가 */}
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTabs;
