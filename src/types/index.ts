export type RoomStatus = 'active' | 'inactive' | 'paid' | 'due-soon' | 'overdue';

export interface Room {
  id: string;
  roomNumber: string;
  tenantName: string;
  phone: string;
  rentAmount: number; // in ETB
  dueDay: number; // Day of the month (1-31)
  status?: string;
  lastPaidDate?: string;
  notes?: string;
}

export type BillCategory = 'electricity' | 'water' | 'internet' | 'maintenance' | 'other';

export interface Bill {
  id: string;
  title: string;
  category: BillCategory;
  accountNumber: string;
  amount: number; // in ETB
  dueDay: number; // Day of the month (1-31)
  isPaid: boolean;
  provider: string; // e.g. EEU, AAWSA, Ethio Telecom
  lastPaidDate?: string;
}

export interface PaymentSetting {
  cbeAccount: string;
  telebirrNumber: string;
  bankName?: string;
  bankAccountNumber?: string;
  accountHolderName: string;
  landlordPhone: string;
  smsTemplate?: string;
  preferredAlertTime: string;
  autoSmsEnabled: boolean;
}

export interface SMSLog {
  id: string;
  recipientName: string;
  roomNumber: string;
  phone: string;
  message: string;
  sentAt: string;
  status: string;
  type?: string;
  language?: string;
  createdAt?: string;
}
