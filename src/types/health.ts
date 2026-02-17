export interface PressureReading {
  id: string;
  userId: string;
  systolic: number;
  diastolic: number;
  pulse?: number | null;
  timestamp: string | Date;
}

export interface SugarReading {
  id: string;
  userId: string;
  value: number;
  type: string;
  timestamp: string | Date;
}

export interface WeightReading {
  id: string;
  userId: string;
  value: number;
  fatMass?: number | null;
  fatPercentage?: number | null;
  muscleMass?: number | null;
  timestamp: string | Date;
}

export interface HealthData {
  pressureReadings: PressureReading[];
  sugarReadings: SugarReading[];
  weightReadings: WeightReading[];
}
