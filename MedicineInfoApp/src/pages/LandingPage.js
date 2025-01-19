import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const LandingPage = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Fade in and scale up the icon
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Slide in the title and subtitle
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for the button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('UploadImagePage');
    });
  };

  return (
    <ImageBackground
      source={{ uri: 'https://expo.dev/static/images/hero/hero-bg.png' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.icon}>💊</Text>
          </Animated.View>

          <Animated.View
            style={{
              transform: [{ translateX: slideAnim }],
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text style={styles.title}>Medicine Info App</Text>
            <Text style={styles.subtitle}>
              Scan your medicine to get detailed information
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }],
            }}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonIcon}>📷</Text>
              <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Floating Pills Animation */}
        <FloatingPills />
      </View>
    </ImageBackground>
  );
};

// Floating Pills Component
const FloatingPills = () => {
  const pillsAnim = [...Array(5)].map(() => ({
    y: useRef(new Animated.Value(0)).current,
    x: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(0)).current,
  }));

  useEffect(() => {
    pillsAnim.forEach((pill, index) => {
      const randomDelay = Math.random() * 2000;
      const randomDuration = 3000 + Math.random() * 2000;

      Animated.loop(
        Animated.sequence([
          Animated.delay(randomDelay),
          Animated.parallel([
            Animated.timing(pill.y, {
              toValue: -200,
              duration: randomDuration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(pill.x, {
              toValue: (index - 2) * 50,
              duration: randomDuration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(pill.scale, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(pill.scale, {
                toValue: 0,
                duration: 500,
                delay: randomDuration - 500,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ])
      ).start();
    });
  }, []);

  return (
    <>
      {pillsAnim.map((pill, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.floatingPill,
            {
              transform: [
                { translateY: pill.y },
                { translateX: pill.x },
                { scale: pill.scale },
              ],
            },
          ]}
        >
          💊
        </Animated.Text>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 32,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(66, 153, 225, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  floatingPill: {
    position: 'absolute',
    fontSize: 24,
    opacity: 0.7,
  },
});

export default LandingPage;