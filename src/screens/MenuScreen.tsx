import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
    TouchableOpacity,
    Dimensions,
    TouchableWithoutFeedback
} from 'react-native';
import { Text } from '../components/common/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, shadows } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

const { width, height } = Dimensions.get('window'); // (Removed static, redundant if unused)

const MenuScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user, setUser } = useStore();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    const handleLogout = () => {
        Alert.alert(
            '로그아웃',
            '정말 로그아웃 하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '로그아웃',
                    style: 'destructive',
                    onPress: () => setUser(null)
                }
            ]
        );
    };

    const MenuItem = ({ title, icon, onPress, isDark }: { title: string; icon: string; onPress: () => void; isDark: boolean }) => (
        <TouchableOpacity
            style={[
                styles.menuItem,
                { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'transparent' }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuIconBox}>
                <MaterialCommunityIcons name={icon as any} size={24} color="#6EE7B7" />
            </View>
            <Text style={styles.menuText}>{title}</Text>
        </TouchableOpacity>
    );

    const closeMenu = () => {
        navigation.goBack();
    };

    // Calculation for Layout
    // Width: 70% of screen (Responsive)
    // Height: 70% of screen (Responsive)
    const menuWidth = width * 0.6;
    const menuHeight = height * 0.6;
    const headerHeight = Platform.OS === 'ios' ? 44 : 56;
    const topOffset = insets.top + headerHeight;

    return (
        <View style={styles.overlay}>
            {/* Backdrop - Transparent but clickable to close */}
            <TouchableWithoutFeedback onPress={closeMenu}>
                <View style={[styles.backdrop, { marginTop: topOffset }]} />
            </TouchableWithoutFeedback>

            {/* Menu Container (Popup Style with Transparency) */}
            <View style={[
                styles.menuContainer,
                {
                    width: menuWidth,
                    height: menuHeight,
                    top: topOffset, // Start below header
                }
            ]}>
                <LinearGradient
                    colors={['rgba(6, 78, 59, 0.50)', 'rgba(4, 120, 87, 0.50)', 'rgba(6, 95, 70, 0.50)']} // High Transparency
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* 1. 팜닥터 (Dark) */}
                    <MenuItem title="팜닥터" icon="stethoscope" onPress={() => { closeMenu(); navigation.navigate('FarmDoctor'); }} isDark={true} />

                    {/* 2. AI 상담 (Light) */}
                    <MenuItem title="AI 상담" icon="chat-processing-outline" onPress={() => { closeMenu(); navigation.navigate('MainTab', { screen: 'HomeTab', params: { screen: 'QnAScreen' } }); }} isDark={false} />

                    {/* 3. 영농일지 (Dark) */}
                    <MenuItem title="영농일지" icon="calendar-text" onPress={() => { closeMenu(); navigation.navigate('MainTab', { screen: 'FarmingLog' }); }} isDark={true} />

                    {/* 4. 일일 보고서 (Light) */}
                    <MenuItem title="일일 보고서" icon="file-chart-outline" onPress={() => { closeMenu(); navigation.navigate('MainTab', { screen: 'HomeTab', params: { screen: 'DailyPrescription' } }); }} isDark={false} />

                    {/* 5. 커뮤니티 (Dark) */}
                    <MenuItem title="커뮤니티" icon="account-group-outline" onPress={() => { closeMenu(); navigation.navigate('MainTab', { screen: 'Community' }); }} isDark={true} />

                    {/* 6. 설정 (Light) */}
                    <MenuItem title="설정" icon="cog-outline" onPress={() => { closeMenu(); navigation.navigate('MainTab', { screen: 'MyFarm', params: { screen: 'Settings' } }); }} isDark={false} />

                    {/* 7. 앱 정보 (Dark) */}
                    <MenuItem title="앱 정보" icon="information-outline" onPress={() => { closeMenu(); navigation.navigate('MainTab', { screen: 'MyFarm', params: { screen: 'AppInfo' } }); }} isDark={true} />

                    {/* Login / Logout */}
                    {user ? (
                        <>
                            <TouchableOpacity
                                style={[styles.logoutButton, { backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 20 }]}
                                onPress={() => {
                                    Alert.alert(
                                        '계정 전환',
                                        '현재 계구에서 로그아웃하고 \n다른 계정으로 로그인 하시겠습니까?',
                                        [
                                            { text: '취소', style: 'cancel' },
                                            {
                                                text: '확인',
                                                onPress: () => setUser(null)
                                            }
                                        ]
                                    );
                                }}
                            >
                                <MaterialCommunityIcons name="account-switch" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text variant="body2" color="#FFFFFF" weight="bold">다른 계정으로 로그인</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Text variant="body2" color="rgba(255,255,255,0.7)" weight="bold" style={{ textDecorationLine: 'underline' }}>로그아웃</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={[styles.logoutButton, { backgroundColor: colors.primary }]}
                            onPress={() => {
                                closeMenu();
                                setUser(null);
                            }}
                        >
                            <Text variant="body2" color="white" weight="bold">로그인 / 회원가입</Text>
                        </TouchableOpacity>
                    )}

                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        // backgroundColor: 'transparent', // Root is transparent so header shows through
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'transparent', // No dimming mask
    },
    menuContainer: {
        position: 'absolute',
        right: 0, // Align right
        backgroundColor: 'transparent', // Transparent to let Gradient control opacity
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20, // Rounded corners on the visible side
        overflow: 'hidden',
        ...shadows.large, // Pop-up feel
    },
    scrollContent: {
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)', // Subtle divider
        paddingVertical: 12,
        paddingHorizontal: spacing.l,
    },
    menuIconBox: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF', // White text for dark mode
    },
    logoutButton: {
        alignItems: 'center',
        marginTop: 10,
        padding: spacing.m,
    }
});

export default MenuScreen;
