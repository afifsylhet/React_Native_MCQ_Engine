import React, { useEffect } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

const { width, height } = Dimensions.get('window');

/**
 * SplashScreen - Initial app startup screen
 * Checks user authentication status and navigates accordingly
 * Shows branding while initializing auth state
 */
export const SplashScreen: React.FC = () => {
    const { isLoading, initializeAuth } = useAuth();
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
    const opacityAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate the splash screen
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Initialize authentication
        initializeAuth();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View
                style={{
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {/* App Logo/Branding */}
                <Text
                    style={{
                        fontSize: 40,
                        fontWeight: '700',
                        color: '#007AFF',
                        marginBottom: 20,
                    }}
                >
                    বিডি নার্সিং প্রিপারেশণ
                </Text>

                {/* App Name */}
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: '500',
                        color: '#6B7280',
                        textAlign: 'center',
                    }}
                >
                    মেডিকেল পরীক্ষার প্রস্তুতি
                </Text>
            </Animated.View>

            {/* Loading indicator */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 50,
                }}
            >
                <Animated.View
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#3B82F6',
                        opacity: opacityAnim,
                    }}
                />
            </View>
        </View>
    );
};
