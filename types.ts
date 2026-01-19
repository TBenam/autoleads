export interface Lead {
  id: string;
  phone: string;
  companyName: string;
  productName: string;
  originalText?: string;
  timestamp: number;
}

export interface UserProfile {
  civility: 'Monsieur' | 'Madame' | '';
  name: string;
}

export interface ExtractionResult {
  leads: Array<{
    phone: string;
    companyName: string;
    productName: string;
  }>;
}