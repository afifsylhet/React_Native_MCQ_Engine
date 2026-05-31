export interface SupportSettings {
    bkashSendMoneyNumber: string;
    whatsAppNumber: string;
    supportEmail: string;
}

export type SupportSettingsPayload = Partial<SupportSettings>;
