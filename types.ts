
export enum DeliveryMode {
  NATURAL = '顺产',
  C_SECTION = '剖宫产'
}

export enum BabyGender {
  MALE = '男',
  FEMALE = '女'
}

export enum Status {
  INCOMPLETE = 'Incomplete',
  COMPLETED_GDM = 'Completed_GDM',
  COMPLETED_NORMAL = 'Completed_Normal'
}

export interface GestationalAge {
  weeks: string;
  days: string;
}

export interface PatientData {
  id: number;
  motherAge: string;
  isGDM: boolean | null;
  deliveryMode: DeliveryMode | null;
  gravidity: string;
  parity: string;
  gestationalAge: GestationalAge;
  preBMI: string;
  weightGain: string;
  ogtt0: string;
  ogtt1: string;
  ogtt2: string;
  babyGender: BabyGender | null;
  birthLength: string;
  birthWeight: string;
  status: Status;
  updatedAt: number;
}

export type StepKey = 
  | 'motherAge' 
  | 'isGDM' 
  | 'deliveryMode' 
  | 'gravidityParity' 
  | 'gestationalAge' 
  | 'preBMI' 
  | 'weightGain' 
  | 'ogtt' 
  | 'babyGender' 
  | 'birthInfo';
