
export enum TeaGrade {
  SUPER_FINE = 'Super Fine',
  GRADE_A = 'Grade A',
  GRADE_B = 'Grade B',
  GRADE_C = 'Grade C'
}

export type Language = 'en' | 'si';

export interface Farmer {
  id: number;
  user_id: string;
  farmer_id_at_center: number;
  name: string;
  phone: string;
  joined_at: string;
  notes?: string;
  is_active: boolean;
}

export interface CollectionRecord {
  id: number;
  user_id: string;
  farmer_id: number;
  farmer_id_at_center: number;
  farmer_name: string;
  weight: number;
  grade: TeaGrade;
  price_per_kg: number;
  total_amount: number;
  timestamp: string;
}

export interface AdvancePayment {
  id: number;
  user_id: string;
  farmer_id: number;
  farmer_id_at_center: number;
  farmer_name: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface FertilizerIssue {
  id: number;
  user_id: string;
  farmer_id: number;
  farmer_id_at_center: number;
  farmer_name: string;
  type: string;
  quantity: number;
  cost_per_unit: number;
  total_cost: number;
  timestamp: string;
}

export interface AppSettings {
  appName: string;
  basePricePerKg: number;
  fertilizerTypes: string[];
  language: Language;
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalWeight: number;
  totalAmount: number;
  count: number;
}

// Fix: Added Inquiry interface which was missing and causing import errors in InquiryView.tsx
export interface Inquiry {
  id: string;
  user_id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  timestamp: string;
}
