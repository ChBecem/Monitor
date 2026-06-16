export interface BabySession {
  id: string; // The 4-digit pairing code, e.g., '1234'
  status: 'active' | 'inactive';
  babyDeviceName: string;
  batteryLevel: number;
  noiseLevel: number; // 0 to 100 representing ambient room sound decibels
  isCrying: boolean;
  nightlightActive: boolean;
  nightlightColor: string; // 'yellow' | 'purple' | 'blue' | 'green'
  flashlightActive: boolean;
  activeLullaby: string;
  parentSpeaking: boolean;
  streamFrame?: string; // base64 compressed camera screenshot (near real-time stream backup)
  facingMode?: 'user' | 'environment';
  streamQuality?: 'low' | 'medium' | 'high';
  babyDeviceId: string;
  parentDeviceId: string;
  updatedAt?: any;
  createdAt?: any;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'volume' | 'lullaby' | 'control';
  message: string;
}
