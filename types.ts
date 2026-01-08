
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR'
}

export enum InstrumentType {
  PLOT = 'PLOT',
  FLAT = 'FLAT',
  HOUSE = 'HOUSE'
}

export enum EnquiryStatus {
  ACTIVE = 'ACTIVE',
  BOOKED = 'BOOKED',
  SOLD = 'SOLD'
}

export interface Interaction {
  id: string;
  agentName: string;
  agentPhone: string;
  customerName: string;
  customerPhone: string;
  offeredRate: number;
  date: string;
  status: EnquiryStatus;
  notes?: string;
}

export interface Instrument {
  id: string;
  projectId: string;
  number: string;
  type: InstrumentType;
  baseRate: number;
  interactions: Interaction[];
}

export interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  instruments: Instrument[];
  createdAt: string;
}

export interface User {
  name: string;
  role: UserRole;
  phone?: string;
}
