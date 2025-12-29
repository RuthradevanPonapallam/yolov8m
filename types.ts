
export enum DetectionCategory {
  HAZARD = 'HAZARD',
  VEHICLE = 'VEHICLE',
  TRAFFIC = 'TRAFFIC',
  PERSON = 'PERSON',
  OTHER = 'OTHER'
}

export interface Detection {
  id: string;
  label: string;
  category: DetectionCategory;
  confidence: number;
  timestamp: number;
  coords: [number, number, number, number]; // [x1, y1, width, height]
}

export interface HazardEvent {
  id: string;
  type: string;
  confidence: number;
  time: string;
}

export interface AppState {
  isActive: boolean;
  source: 'webcam' | 'video';
  hazards: HazardEvent[];
  stats: {
    cars: number;
    people: number;
    hazards: number;
  };
}
