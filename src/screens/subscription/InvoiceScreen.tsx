import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '../../api/subscription.api';
import { queryKeys } from '../../api/queryClient';

type Props = { navigation: { goBack: () => void } };

const PLAN_LABELS: Record<string, string> = {
    quarterly: '৪ মাসের প্ল্যান',
    half_yearly: '৪ মাসের প্ল্যান',
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    approved: { label: 'সক্রিয়', color: '#166534', bg: '#DCFCE7' },
    pending: { label: 'অপেক্ষামাণ', color: '#92400E', bg: '#FEF3C7' },
    rejected: { label: 'প্রত্যাখ্যাত', color: '#991B1B', bg: '#FEE2E2' },
    expired: { label: 'মেয়াদোত্তীর্ণ', color: '#6B7280', bg: '#F3F4F6' },
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const InvoiceScreen: React.FC<Props> = ({ navigation }) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: queryKeys.subscription.history(),
        queryFn: () => subscriptionApi.getSubscriptionHistory(1),
    });

    const invoices = (data as any)?.subscriptions || [];

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
                        ইনভয়েস ইতিহাস
                    </Text>
                    <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                        আপনার সমস্ত পেমেন্ট রেকর্ড
                    </Text>
                </View>
            </View>

            {isLoading && (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            )}

            {isError && (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#EF4444" />
                    <Text style={{ color: '#EF4444', marginTop: 8, fontSize: 14 }}>
                        ডেটা লোড করতে সমস্যা হয়েছে
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        style={{
                            marginTop: 12,
                            backgroundColor: '#3B82F6',
                            paddingVertical: 8,
                            paddingHorizontal: 20,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>আবার চেষ্টা করুন</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!isLoading && !isError && invoices.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                    <MaterialCommunityIcons name="receipt" size={52} color="#D1D5DB" />
                    <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 15 }}>
                        কোনো ইনভয়েস পাওয়া যায়নি
                    </Text>
                </View>
            )}

            {invoices.map((inv: any) => {
                const statusInfo = STATUS_LABELS[inv.status] || STATUS_LABELS.pending;
                return (
                    <View
                        key={inv._id}
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 14,
                            padding: 16,
                            marginBottom: 14,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.06,
                            shadowRadius: 6,
                            elevation: 3,
                        }}
                    >
                        {/* Top row: plan + status badge */}
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 12,
                            }}
                        >
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>
                                {PLAN_LABELS[inv.plan] || inv.plan}
                            </Text>
                            <View
                                style={{
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                    backgroundColor: statusInfo.bg,
                                    borderRadius: 20,
                                }}
                            >
                                <Text style={{ fontSize: 12, fontWeight: '600', color: statusInfo.color }}>
                                    {statusInfo.label}
                                </Text>
                            </View>
                        </View>

                        {/* Invoice details */}
                        {[
                            { label: 'ইনভয়েস আইডি', value: inv._id ? String(inv._id).slice(-10).toUpperCase() : '—' },
                            { label: 'ক্রয়ের তারিখ', value: formatDate(inv.createdAt) },
                            { label: 'প্যাকেজের নাম', value: PLAN_LABELS[inv.plan] || inv.plan || '—' },
                            { label: 'পরিশোধিত পরিমাণ', value: inv.paymentAmount ? `৳ ${inv.paymentAmount}` : '—' },
                            { label: 'ট্রানজেকশন আইডি', value: inv.transactionId || '—' },
                            { label: 'সক্রিয়করণের তারিখ', value: inv.startDate ? formatDate(inv.startDate) : '—' },
                            { label: 'মেয়াদ শেষের তারিখ', value: inv.endDate ? formatDate(inv.endDate) : '—' },
                            { label: 'পেমেন্টের অবস্থা', value: statusInfo.label },
                        ].map((row) => (
                            <View
                                key={row.label}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingVertical: 6,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#F3F4F6',
                                }}
                            >
                                <Text style={{ fontSize: 13, color: '#6B7280', flex: 1 }}>
                                    {row.label}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: '500',
                                        color: '#1F2937',
                                        flex: 1,
                                        textAlign: 'right',
                                    }}
                                    numberOfLines={1}
                                    ellipsizeMode="middle"
                                >
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                );
            })}
        </ScrollView>
    );
};
