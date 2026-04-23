import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Animated as RNAnimated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  useAnimatedScrollHandler,
  SharedValue,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { useStore } from '../../store/useStore';

const { width, height } = Dimensions.get('window');

// --- Types ---
interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  image?: any;
  type: 'hero' | 'data' | 'ai' | 'no_sensor';
}

const SLIDES: SlideData[] = [
  {
    id: '1',
    title: 'Your Farm, Reborn.',
    subtitle: '당신의 농장이 디지털로 재탄생합니다.\n실시간 데이터로 숨쉬는 농장을 만나보세요.',
    image: require('../../assets/images/logo.png'), // Placeholder, needs actual 3D asset or grape image
    type: 'hero',
  },
  {
    id: '2',
    title: 'Hyper-Personalized Insights',
    subtitle: '전국 평균이 아닌,\n오직 당신의 "하우스 3동" 데이터.',
    type: 'data',
  },
  {
    id: '3',
    title: 'Meet Your Smart Farm OS',
    subtitle: '24시간 깨어있는 AI 비서가\n지금 필요한 조치를 제안합니다.',
    type: 'ai',
  },
  {
    id: '4',
    title: '📷 센서가 없어도 괜찮아요',
    subtitle:
      '영농일지와 사진을 자주 올려주시면\nAI가 농장 상태를 더 정확히 분석해드립니다.\n\n' +
      '✓ 매일 사진 1장이면 충분\n' +
      '✓ 간단한 메모로 이상 신호 감지\n' +
      '✓ 자동으로 일일 보고서 생성',
    type: 'no_sensor',
  },
];

// --- Components ---

// 1. Particle / Data Stream Background Effect
const Particle = ({ index, total }: { index: number; total: number }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(Math.random() * 0.5 + 0.5);

  useEffect(() => {
    const delay = Math.random() * 2000;
    const duration = 4000 + Math.random() * 3000;

    translateY.value = withRepeat(
      withSequence(
        withTiming(-height, { duration: 0 }), // Reset to bottom (conceptually, we start off screen)
        withTiming(height, { duration: duration, easing: Easing.linear }) // Move up? No, usually rain down or float up. Let's float UP.
      ),
      -1,
      false
    );
    // Let's actually animate FROM bottom TO top
    translateY.value = height;
    translateY.value = withRepeat(
      withTiming(-100, { duration: duration, easing: Easing.linear }),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: duration * 0.5 }),
        withTiming(0, { duration: duration * 0.5 })
      ), -1, false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
      opacity: opacity.value,
      left: `${(index / total) * 100}%`,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          left: Math.random() * width,
          // Override the strict grid left for more randomness if desired, 
          // or stick to grid. Let's use random in style override.
          bottom: -20, // Start slightly below
        },
      ]}
    />
  );
};

// 2. Waveform Animation (for AI slide)
const WaveLine = ({ delay }: { delay: number }) => {
  const heightVal = useSharedValue(10);

  useEffect(() => {
    heightVal.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 500 + Math.random() * 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 500 + Math.random() * 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    height: heightVal.value,
  }));

  return <Animated.View style={[styles.waveLine, style]} />;
}

const OnboardingSlidesScreen = () => {
  const navigation = useNavigation<any>();
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const setHasSeenOnboarding = useStore((state) => state.setHasSeenOnboarding);

  const handleStart = async () => {
    // 소개 완료 플래그 저장 → 회원가입(SMS 인증)으로 직진
    // LoginScreen 내부에서 SMS 인증 성공 시 신규/기존 유저 자동 처리 + 토큰 저장.
    // 가입 직후 user.onboarding_completed=false 상태면 RootNavigator가 setup 모드로 전환.
    await setHasSeenOnboarding(true);
    navigation.navigate('Login' as never);
  };

  const handleLoginNav = () => {
    navigation.navigate('Login');
  };

  // 3. Slide Item Component (Extracted to fix Invalid Hook Call)
  const SlideItem = ({ item, index, scrollX, onStart }: { item: SlideData, index: number, scrollX: SharedValue<number>, onStart: () => void }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const animatedContentStyle = useAnimatedStyle(() => {
      const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0]);
      const translateY = interpolate(scrollX.value, inputRange, [50, 0, 50]);
      const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8]);
      return {
        opacity,
        transform: [{ translateY }, { scale }],
      };
    });

    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
          {/* Visual Element based on Type */}
          <View style={styles.visualContainer}>
            {item.type === 'hero' && (
              /* Rotating 3D-ish element placeholder */
              <View style={styles.circleGraphic}>
                <Image source={item.image} style={styles.heroImage} />
              </View>
            )}
            {item.type === 'data' && (
              /* Glass Card Fake Dashboard */
              <BlurView
                style={styles.glassCard}
                tint="light"
                intensity={10}
              >
                <Text style={styles.cardTitle}>Live Sensor Data</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Temp</Text>
                  <Text style={styles.value}>24.5°C</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Humidity</Text>
                  <Text style={styles.value}>68%</Text>
                </View>
              </BlurView>
            )}
            {item.type === 'ai' && (
              /* Waveform */
              <View style={styles.waveContainer}>
                {[...Array(5)].map((_, i) => <WaveLine key={i} delay={i * 100} />)}
              </View>
            )}
            {item.type === 'no_sensor' && (
              /* 센서 없는 농가 안내 - 카메라 아이콘 원 */
              <View style={styles.circleGraphic}>
                <Text style={{ fontSize: 64 }}>📷</Text>
              </View>
            )}
          </View>

          {/* Text Content */}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>

          {/* Button only on last slide (or all if preferred, but usually last) */}
          {index === SLIDES.length - 1 && (
            <TouchableOpacity onPress={onStart} style={styles.startButton}>
              <LinearGradient
                colors={['#00C6FB', '#005BEA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.startButtonText}>Start Experience</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: SlideData; index: number }) => {
    return <SlideItem item={item} index={index} scrollX={scrollX} onStart={handleStart} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Global Dark Gradient Background */}
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']} // 'The Matrix' / Deep Space vibe
        style={StyleSheet.absoluteFillObject}
      />

      {/* 2. Particle Effects Layer */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {[...Array(20)].map((_, i) => (
          <Particle key={i} index={i} total={20} />
        ))}
      </View>

      {/* 3. Slider */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* 4. Pagination / Progress Dots */}
      <View style={styles.pagination}>
        {SLIDES.map((_, index) => {
          const animatedDotStyle = useAnimatedStyle(() => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const widthVal = interpolate(scrollX.value, inputRange, [8, 20, 8], 'clamp');
            const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], 'clamp');
            return {
              width: widthVal,
              opacity,
            };
          });
          return <Animated.View key={index} style={[styles.dot, animatedDotStyle]} />;
        })}
      </View>

      {/* 5. Skip / Login Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleStart}
      >
        <Text style={styles.skipText}>로그인 / 건너뛰기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  visualContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  circleGraphic: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,198,251, 0.3)',
  },
  heroImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  glassCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)', // Fallback
    justifyContent: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardTitle: {
    color: '#00C6FB',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    gap: 5,
  },
  waveLine: {
    width: 6,
    backgroundColor: '#00C6FB',
    borderRadius: 3,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00C6FB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  startButton: {
    width: '80%',
    height: 56,
    shadowColor: '#00C6FB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  gradientButton: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pagination: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C6FB',
  },
});

export default OnboardingSlidesScreen;
