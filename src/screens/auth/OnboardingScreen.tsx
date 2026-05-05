import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

interface OnboardingStep {
    id: number;
    title: string;
    description: string;
    icon: string;
}

const onboardingSteps: OnboardingStep[] = [
    {
        id: 1,
        title: 'বিডি নার্সিং প্রিপারেশণে স্বাগতম',
        description: 'বাংলাদেশে নার্সিং পরীক্ষার প্রস্তুতির জন্য আপনার সেরা সঙ্গী',
        icon: '👋',
    },
    {
        id: 2,
        title: 'বিস্তৃত প্রশ্নসংগ্রহ',
        description: 'হাজার হাজার বাছাই করা নার্সিং পরীক্ষার প্রশ্ন ও উত্তর',
        icon: '📚',
    },
    {
        id: 3,
        title: 'অগ্রগতি অনুসরণ করুন',
        description: 'নিজের পারফরম্যান্স দেখুন এবং লিডারবোর্ডে অন্যদের সঙ্গে প্রতিযোগিতা করুন',
        icon: '📊',
    },
    {
        id: 4,
        title: 'প্রিমিয়াম ফিচার',
        description: 'অ্যাডভান্সড অ্যানালিটিক্স ও ব্যক্তিগত স্টাডি প্ল্যান আনলক করুন',
        icon: '⭐',
    },
];

/**
 * OnboardingScreen - First-run onboarding flow
 * Introduces app features and guides user to login/registration
 */
export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            navigation.replace('Login');
        }
    };

    const handleSkip = () => {
        navigation.replace('Login');
    };

    const step = onboardingSteps[currentStep];
    const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {/* Skip Button */}
            <View
                style={{
                    paddingHorizontal: 20,
                    paddingTop: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <View />
                <TouchableOpacity onPress={handleSkip}>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#6B7280',
                        }}
                    >
                        এড়িয়ে যান
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingVertical: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {/* Icon */}
                <Text
                    style={{
                        fontSize: 80,
                        marginBottom: 40,
                    }}
                >
                    {step.icon}
                </Text>

                {/* Title */}
                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: '700',
                        color: '#1F2937',
                        textAlign: 'center',
                        marginBottom: 12,
                    }}
                >
                    {step.title}
                </Text>

                {/* Description */}
                <Text
                    style={{
                        fontSize: 16,
                        color: '#6B7280',
                        textAlign: 'center',
                        lineHeight: 24,
                    }}
                >
                    {step.description}
                </Text>
            </ScrollView>

            {/* Footer */}
            <View
                style={{
                    paddingHorizontal: 20,
                    paddingBottom: 40,
                }}
            >
                {/* Progress Bar */}
                <View
                    style={{
                        width: '100%',
                        height: 4,
                        backgroundColor: '#E5E7EB',
                        borderRadius: 2,
                        marginBottom: 20,
                        overflow: 'hidden',
                    }}
                >
                    <View
                        style={{
                            height: '100%',
                            backgroundColor: '#3B82F6',
                            width: `${progress}%`,
                        }}
                    />
                </View>

                {/* Dots Indicator */}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginBottom: 24,
                        gap: 8,
                    }}
                >
                    {onboardingSteps.map((_, index) => (
                        <View
                            key={index}
                            style={{
                                width: index === currentStep ? 32 : 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: index === currentStep ? '#3B82F6' : '#D1D5DB',
                            }}
                        />
                    ))}
                </View>

                {/* Next Button */}
                <TouchableOpacity
                    onPress={handleNext}
                    style={{
                        backgroundColor: '#3B82F6',
                        paddingVertical: 14,
                        paddingHorizontal: 24,
                        borderRadius: 8,
                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#FFFFFF',
                        }}
                    >
                        {currentStep === onboardingSteps.length - 1 ? 'শুরু করুন' : 'পরবর্তী'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
