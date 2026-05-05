export interface SubscriptionPlan {
    planId: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    durationDays: number;
    benefits: string[];
    isActive: boolean;
}

export interface SubscribePayload {
    plan: 'quarterly' | 'half_yearly';
    transactionId: string;
    paymentAmount: number;
}
