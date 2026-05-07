import { GenderDto } from '@centile-grid/contract';

export type PatientInfo = {
  gender?: GenderDto;
  age?: number; // years
  height?: number; // cm
  weight?: number; // kg
};
