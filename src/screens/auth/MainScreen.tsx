import React, { useMemo, useState, useEffect } from 'react';
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInUp, ZoomIn, withRepeat, withTiming, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Main'>;

type PrepCard = {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    badge: 'Admission' | 'License';
};

const admissionCards: PrepCard[] = [
    {
        title: 'ডিপ্লোমা ইন মিডওয়াইফারি',
        icon: 'stethoscope',
        badge: 'Admission',
    },
    {
        title: 'ডিপ্লোমা ইন নার্সিং সায়েন্স ও মিডওয়াইফারি',
        icon: 'medical-bag',
        badge: 'Admission',
    },
    {
        title: 'বি.এসসি. ইন নার্সিং',
        icon: 'school-outline',
        badge: 'Admission',
    },
    {
        title: 'পোস্ট বেসিক ইন মিডওয়াইফারি',
        icon: 'clipboard-check-outline',
        badge: 'Admission',
    },
];

const licenseCards: PrepCard[] = [
    {
        title: 'ডিপ্লোমা ইন মিডওয়াইফারি',
        icon: 'heart-pulse',
        badge: 'License',
    },
    {
        title: 'ডিপ্লোমা ইন নার্সিং সায়েন্স ও মিডওয়াইফারি',
        icon: 'hospital-box-outline',
        badge: 'License',
    },
    {
        title: 'বি.এসসি. ইন নার্সিং',
        icon: 'book-open-page-variant-outline',
        badge: 'License',
    },
    {
        title: 'পোস্ট বেসিক ইন মিডওয়াইফারি',
        icon: 'certificate-outline',
        badge: 'License',
    },
];

const usageSteps = [
    'ভর্তি অথবা লাইসেন্স পরীক্ষার প্রস্তুতি বেছে নিন।',
    'আপনার প্রোগ্রাম ট্র্যাক নির্বাচন করুন।',
    'সঙ্গে সঙ্গেই একটি অনুশীলন পরীক্ষা শুরু করুন।',
    'উত্তর জমা দিন এবং আপনার স্কোর দেখুন।',
    'দ্রুত উন্নতির জন্য দুর্বল অংশগুলোতে অনুশীলন করুন।',
];

export const MainScreen: React.FC<Props> = ({ navigation }) => {
    const [chooserOpen, setChooserOpen] = useState(false);

    // Button pulse animation
    const ctaScale = useSharedValue(1);
    useEffect(() => {
        ctaScale.value = withRepeat(
            withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, [ctaScale]);

    const ctaAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ctaScale.value }],
    }));

    const groups = useMemo(
        () => [
            { title: 'ভর্তি পরীক্ষার প্রস্তুতি', items: admissionCards },
            { title: 'লাইসেন্স পরীক্ষার প্রস্তুতি', items: licenseCards },
        ],
        []
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <LinearGradient
                colors={['#E8FBFF', '#F3F8FF', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pageGradient}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.delay(0)}>
                        <LinearGradient
                            colors={['#0E7490', '#2563EB']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.hero}
                        >
                            <Animated.View
                                style={styles.heroIconWrap}
                                entering={ZoomIn.delay(100)}
                            >
                                <MaterialCommunityIcons name="heart-pulse" size={34} color="#FFFFFF" />
                            </Animated.View>
                            <Text style={styles.heroTitle}>BD Nursing Preparation</Text>
                            <Text style={styles.heroSubtitle}>
                                ভর্তি ও লাইসেন্স পরীক্ষার জন্য স্মার্ট প্রস্তুতি
                            </Text>
                            <Text style={styles.heroSupportText}>
                                নার্সিং ক্যারিয়ারের সাফল্য শুরু হয় নিয়মিত ও মনোযোগী অনুশীলনে।
                            </Text>
                        </LinearGradient>
                    </Animated.View>

                    {groups.map((group, groupIndex) => (
                        <Animated.View
                            key={group.title}
                            style={styles.sectionWrap}
                            entering={FadeInDown.delay(150 + groupIndex * 100)}
                        >
                            <Text style={styles.sectionTitle}>{group.title}</Text>
                            <View style={styles.cardGrid}>
                                {group.items.map((item, itemIndex) => {
                                    const isAdmission = item.badge === 'Admission';

                                    return (
                                        <Animated.View
                                            key={`${group.title}-${item.title}`}
                                            style={styles.card}
                                            entering={FadeInUp.delay(200 + groupIndex * 100 + itemIndex * 50)}
                                        >
                                            <View
                                                style={[
                                                    styles.cardIconWrap,
                                                    {
                                                        backgroundColor: isAdmission
                                                            ? 'rgba(37, 99, 235, 0.12)'
                                                            : 'rgba(14, 116, 144, 0.12)',
                                                    },
                                                ]}
                                            >
                                                <MaterialCommunityIcons
                                                    name={item.icon}
                                                    size={22}
                                                    color={isAdmission ? '#2563EB' : '#0E7490'}
                                                />
                                            </View>
                                            <Text style={styles.cardTitle}>{item.title}</Text>
                                            <View
                                                style={[
                                                    styles.badge,
                                                    {
                                                        backgroundColor: isAdmission
                                                            ? '#DBEAFE'
                                                            : '#CCFBF1',
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.badgeText,
                                                        { color: isAdmission ? '#1D4ED8' : '#0F766E' },
                                                    ]}
                                                >
                                                    {isAdmission ? 'ভর্তি' : 'লাইসেন্স'}
                                                </Text>
                                            </View>
                                            <Text style={styles.cardHint}>এমসিকিউ ও সত্য/মিথ্যা অনুশীলন</Text>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    ))}

                    <Animated.View
                        style={styles.instructionsCard}
                        entering={FadeInDown.delay(400)}
                    >
                        <View style={styles.instructionsHeaderRow}>
                            <MaterialCommunityIcons name="information-outline" size={20} color="#0E7490" />
                            <Text style={styles.instructionsTitle}>অ্যাপ কীভাবে ব্যবহার করবেন</Text>
                        </View>
                        {usageSteps.map((step, index) => (
                            <View key={step} style={styles.stepRow}>
                                <View style={styles.stepIndexWrap}>
                                    <Text style={styles.stepIndex}>{index + 1}</Text>
                                </View>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </Animated.View>

                    <Animated.View
                        style={styles.sectionWrap}
                        entering={FadeInDown.delay(500)}
                    >
                        <Text style={styles.sectionTitle}>বিডি নার্সিং প্রিপারেশণ টিম</Text>
                        <View style={styles.teamGrid}>
                            <View style={styles.teamCard}>
                                <Image
                                    source={require('../../../assets/images/managing_director.png')}
                                    style={styles.avatarImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.teamName}>শরীফ আহমদ হিউয়েন</Text>
                                <Text style={styles.teamRole}>ম্যানেজিং ডিরেক্টর</Text>
                                <Text style={styles.teamEmail}>Md.huyen40@gmail.com</Text>
                                <Text style={styles.teamDesc}>
                                    কৌশল, মান ও একাডেমিক নির্দেশনা পরিচালনা করেন।
                                </Text>
                            </View>

                            <View style={styles.teamCard}>
                                <Image
                                    source={require('../../../assets/images/system_engineer.jpg')}
                                    style={styles.avatarImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.teamName}>আফিফ আহমদ</Text>
                                <Text style={styles.teamRole}>সিস্টেম ইঞ্জিনিয়ার</Text>
                                <Text style={styles.teamEmail}>afif.ahmed@yahoo.com</Text>
                                <Text style={styles.teamDesc}>
                                    নির্ভরযোগ্য লার্নিং প্ল্যাটফর্ম তৈরি ও রক্ষণাবেক্ষণ করেন।
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View
                        style={ctaAnimatedStyle}
                        entering={FadeInUp.delay(600)}
                    >
                        <Pressable
                            style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
                            onPress={() => setChooserOpen(true)}
                        >
                            <Text style={styles.ctaText}>অনুশীলন শুরু করুন</Text>
                        </Pressable>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(650)}>
                        <Text style={styles.footerText}>বিডি নার্সিং প্রিপারেশণ v1.0.0</Text>
                    </Animated.View>
                </ScrollView>
            </LinearGradient>

            <Modal visible={chooserOpen} transparent animationType="slide" onRequestClose={() => setChooserOpen(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setChooserOpen(false)}>
                    <Pressable style={styles.bottomSheet} onPress={() => null}>
                        <Text style={styles.sheetTitle}>আপনার পথ বেছে নিন</Text>
                        <Text style={styles.sheetSubTitle}>নতুন ব্যবহারকারী হিসেবে শুরু করুন অথবা লগইন করে এগিয়ে যান।</Text>

                        <Pressable
                            style={({ pressed }) => [styles.sheetPrimaryButton, pressed && styles.sheetPressed]}
                            onPress={() => {
                                setChooserOpen(false);
                                navigation.navigate('Register');
                            }}
                        >
                            <Text style={styles.sheetPrimaryText}>নতুন ব্যবহারকারী — রেজিস্টার করুন</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [styles.sheetSecondaryButton, pressed && styles.sheetPressed]}
                            onPress={() => {
                                setChooserOpen(false);
                                navigation.navigate('Login');
                            }}
                        >
                            <Text style={styles.sheetSecondaryText}>বিদ্যমান ব্যবহারকারী — লগইন করুন</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#E8FBFF',
    },
    pageGradient: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 24,
    },
    hero: {
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 22,
        shadowColor: '#0B1A2D',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.24,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 22,
    },
    heroIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 34,
        lineHeight: 38,
        fontFamily: 'Sora_700Bold',
    },
    heroSubtitle: {
        color: '#E5F6FF',
        marginTop: 8,
        fontSize: 15,
        lineHeight: 22,
        fontFamily: 'Nunito_600SemiBold',
    },
    heroSupportText: {
        color: '#D7F2FF',
        marginTop: 8,
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Nunito_400Regular',
    },
    sectionWrap: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        lineHeight: 28,
        color: '#1A1A18',
        fontFamily: 'Sora_600SemiBold',
        marginBottom: 12,
    },
    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    card: {
        width: '48.2%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 10,
        borderWidth: 1,
        borderColor: '#E6EEF7',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        marginTop: 10,
        color: '#1F2937',
        fontFamily: 'Nunito_700Bold',
        fontSize: 13,
        lineHeight: 18,
        minHeight: 36,
    },
    badge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginTop: 8,
    },
    badgeText: {
        fontSize: 11,
        fontFamily: 'Nunito_700Bold',
    },
    cardHint: {
        marginTop: 6,
        color: '#64748B',
        fontFamily: 'Nunito_400Regular',
        fontSize: 12,
        lineHeight: 16,
    },
    instructionsCard: {
        backgroundColor: '#ECFEFF',
        borderWidth: 1,
        borderColor: '#CFFAFE',
        borderRadius: 18,
        padding: 14,
        marginBottom: 20,
    },
    instructionsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    instructionsTitle: {
        fontSize: 18,
        color: '#164E63',
        fontFamily: 'Sora_600SemiBold',
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepIndexWrap: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#0E7490',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    stepIndex: {
        color: '#FFFFFF',
        fontFamily: 'Nunito_700Bold',
        fontSize: 12,
        lineHeight: 15,
    },
    stepText: {
        flex: 1,
        color: '#134E4A',
        fontSize: 13,
        lineHeight: 18,
        fontFamily: 'Nunito_600SemiBold',
    },
    teamGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    teamCard: {
        width: '48.2%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 12,
        alignItems: 'center',
    },
    avatarCircle: {
        width: 62,
        height: 62,
        borderRadius: 31,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#BAE6FD',
        backgroundColor: '#F0F9FF',
        marginBottom: 10,
    },
    avatarImage: {
        width: 62,
        height: 62,
        borderRadius: 31,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#BAE6FD',
    },
    teamName: {
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 18,
        color: '#111827',
        fontFamily: 'Nunito_700Bold',
    },
    teamRole: {
        marginTop: 2,
        fontSize: 12,
        color: '#0E7490',
        fontFamily: 'Nunito_600SemiBold',
    },
    teamEmail: {
        marginTop: 4,
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'Nunito_400Regular',
    },
    teamDesc: {
        marginTop: 8,
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 16,
        color: '#4B5563',
        fontFamily: 'Nunito_400Regular',
    },
    ctaButton: {
        width: '100%',
        borderRadius: 16,
        paddingVertical: 16,
        backgroundColor: '#F59E0B',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
        elevation: 6,
    },
    ctaPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.985 }],
    },
    ctaText: {
        color: '#0B1020',
        fontSize: 18,
        lineHeight: 22,
        fontFamily: 'Sora_700Bold',
    },
    footerText: {
        marginTop: 14,
        textAlign: 'center',
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'Nunito_600SemiBold',
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    bottomSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 28,
    },
    sheetTitle: {
        color: '#111827',
        fontSize: 20,
        lineHeight: 26,
        fontFamily: 'Sora_700Bold',
    },
    sheetSubTitle: {
        marginTop: 6,
        color: '#4B5563',
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Nunito_400Regular',
    },
    sheetPrimaryButton: {
        marginTop: 16,
        borderRadius: 14,
        backgroundColor: '#0E7490',
        paddingVertical: 13,
        alignItems: 'center',
    },
    sheetPrimaryText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Nunito_700Bold',
    },
    sheetSecondaryButton: {
        marginTop: 10,
        borderRadius: 14,
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        paddingVertical: 13,
        alignItems: 'center',
    },
    sheetSecondaryText: {
        color: '#1D4ED8',
        fontSize: 15,
        fontFamily: 'Nunito_700Bold',
    },
    sheetPressed: {
        opacity: 0.88,
    },
});
