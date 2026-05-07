export type Gender = 'male' | 'female';

export type GrowthParameter = 'height' | 'weight';

export type PatientInfo = {
  gender?: Gender;
  age?: number; // years
  height?: number; // cm
  weight?: number; // kg
};
