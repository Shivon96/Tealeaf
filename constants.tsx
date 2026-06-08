
import { TeaGrade, Farmer, AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'TeaLeaf Pro',
  basePricePerKg: 350.00,
  fertilizerTypes: [
    'Urea (High Nitrogen)',
    'NPK (General Purpose)',
    'T.750 (Special Blend)',
    'DAP (Phosphate)'
  ],
  // Fix: Added missing language property to satisfy AppSettings interface requirement
  language: 'en'
};

// Removed INITIAL_FARMERS to ensure clean multi-user experience.
export const INITIAL_FARMERS: Farmer[] = [];
