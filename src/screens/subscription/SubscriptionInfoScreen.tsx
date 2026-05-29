import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SubscriptionStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SubscriptionStackParamList, 'SubscriptionInfo'>;

interface PlanInfo {
    name: string;
    banglaName: string;
    weeklyLimit: number;
    exams25: number;
    exams50: number;
    exams100: number;
    color: string;
    badgeColor: string;
}

const PLANS: PlanInfo[] = [
    {
        name: 'free',
        banglaName: 'ফ্রি প্ল্যান',
        weeklyLimit: 400,
        exams25: 16,
        exams50: 8,
        exams100: 4,
        color: '#6B7280',
        badgeColor: '#F3F4F6',
    },
    {
        name: 'quarterly',
        banglaName: '৩ মাসের প্ল্যান',
        weeklyLimit: 900,
        exams25: 36,
        exams50: 18,
        exams100: 9,
        color: '#3B82F6',
        badgeColor: '#EFF6FF',
    },
    {
        name: 'half_yearly',
        banglaName: '৬ মাসের প্ল্যান',
        weeklyLimit: 1200,
        exams25: 48,
        exams50: 24,
        exams100: 12,
        color: '#7C3AED',
        badgeColor: '#F5F3FF',
    },
];

export const SubscriptionInfoScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#F9FAFB' }}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <View>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#1F2937' }}>
                        সাবস্ক্রিপশন তথ্য
                    </Text>
                    <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                        সাপ্তাহিক প্রশ্ন সীমা ও পরীক্ষার সুবিধা
                    </Text>
                </View>
            </View>

            {/* Plan Cards */}
            {PLANS.map((plan) => (
                <View
                    key={plan.name}
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        padding: 18,
                        marginBottom: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 6,
                        elevation: 3,
                        borderLeftWidth: 4,
                        borderLeftColor: plan.color,
                    }}
                >
                    {/* Plan name */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 14,
                        }}
                    >
                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#1F2937' }}>
                            {plan.banglaName}
                        </Text>
                        <View
                            style={{
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                backgroundColor: plan.badgeColor,
                                borderRadius: 20,
                            }}
                        >
                            <Text style={{ fontSize: 12, fontWeight: '600', color: plan.color }}>
                                {plan.weeklyLimit} প্রশ্ন/সপ্তাহ
                            </Text>
                        </View>
                    </View>

                    {/* Exam count breakdown */}
                    <View
                        style={{
                            backgroundColor: '#F9FAFB',
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 12,
                        }}
                    >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                            পরীক্ষার সংখ্যা (সাপ্তাহিক)
                        </Text>
                        {[
                            { count: 25, exams: plan.exams25 },
                            { count: 50, exams: plan.exams50 },
                            { count: 100, exams: plan.exams100 },
                        ].map((row) => (
                            <View
                                key={row.count}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingVertical: 5,
                                    borderBottomWidth: row.count !== 100 ? 1 : 0,
                                    borderBottomColor: '#E5E7EB',
                                }}
                            >
                                <Text style={{ fontSize: 13, color: '#6B7280' }}>
                                    {row.count} প্রশ্নের পরীক্ষা
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937' }}>
                                    সর্বোচ্চ {row.exams}টি
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Mixed usage note */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            backgroundColor: '#FEF9C3',
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 10,
                        }}
                    >
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={16}
                            color="#92400E"
                            style={{ marginRight: 6, marginTop: 1 }}
                        />
                        <Text style={{ fontSize: 12, color: '#92400E', flex: 1, lineHeight: 18 }}>
                            মিশ্র ব্যবহার সম্ভব। যেমন: ২টি ১০০ প্রশ্ন + ৩টি ৫০ প্রশ্ন + ২টি ২৫ প্রশ্নের পরীক্ষা — যতক্ষণ মোট সাপ্তাহিক সীমার মধ্যে থাকে।
                        </Text>
                    </View>

                    {/* Weekly reset info */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <MaterialCommunityIcons name="refresh" size={14} color={plan.color} style={{ marginRight: 5 }} />
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                            প্রতি সোমবার সাপ্তাহিক সীমা রিসেট হয়
                        </Text>
                    </View>
                </View>
            ))}

            {/* Limit exceeded warning */}
            <View
                style={{
                    backgroundColor: '#FEF2F2',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#FECACA',
                    marginBottom: 16,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#DC2626' }}>
                        সীমা অতিক্রমের উদাহরণ
                    </Text>
                </View>
                <Text style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 20 }}>
                    উদাহরণ: আপনি ২টি ১০০ প্রশ্ন (= ২০০) + ৭টি ২৫ প্রশ্ন (= ১৭৫) পরীক্ষা দিয়েছেন। মোট ব্যবহার = ৩৭৫।{'\n\n'}
                    ফ্রি প্ল্যানে (৪০০ সীমা): আপনি আর ৫০ বা ১০০ প্রশ্নের পরীক্ষা শুরু করতে পারবেন না। কারণ এতে সাপ্তাহিক সীমা ছাড়িয়ে যাবে।{'\n\n'}
                    সিস্টেম স্বয়ংক্রিয়ভাবে পরীক্ষা শুরু আটকে দেবে এবং বাকি সীমা দেখাবে।
                </Text>
            </View>

            {/* Weekly reset explanation */}
            <View
                style={{
                    backgroundColor: '#F0FDF4',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#BBF7D0',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <MaterialCommunityIcons name="calendar-refresh" size={18} color="#166534" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#166534' }}>
                        সাপ্তাহিক রিসেট
                    </Text>
                </View>
                <Text style={{ fontSize: 13, color: '#14532D', lineHeight: 20 }}>
                    প্রতি সোমবার সকাল ১২:০০ AM (UTC) তে আপনার সাপ্তাহিক প্রশ্ন গণনা রিসেট হয়।
                    রিসেটের পর আপনি পুনরায় সম্পূর্ণ সাপ্তাহিক সীমা ব্যবহার করতে পারবেন।
                </Text>
            </View>
        </ScrollView>
    );
};
