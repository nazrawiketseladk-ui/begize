import { Room, Bill, PaymentSetting } from '../types';

export const INITIAL_PAYMENT_SETTINGS: PaymentSetting = {
  cbeAccount: "1000 4829 1048",
  telebirrNumber: "+251 91 123 4567",
  accountHolderName: "Ketsela Tadesse",
  landlordPhone: "+251 91 100 2233",
  preferredAlertTime: "09:00",
  autoSmsEnabled: true
};

export const INITIAL_ROOMS: Room[] = [];

export const INITIAL_BILLS: Bill[] = [];
