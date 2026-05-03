export type UserRole = 'user' | 'admin' | 'technician';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: any; // Timestamp
}

export interface Appliance {
  id: string;
  ownerId: string;
  type: 'AC' | 'Refrigerator' | 'Washing Machine' | 'Dishwasher' | 'Microwave' | 'Other';
  model?: string;
  brand?: string;
  purchaseDate?: string;
  warrantyUntil?: string;
}

export interface Booking {
  id: string;
  userId: string;
  applianceId: string;
  serviceType: 'Repair' | 'Maintenance' | 'Installation' | 'Consultation';
  description?: string;
  scheduledAt: any; // Timestamp
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  technicianId?: string;
  createdAt: any; // Timestamp
  updatedAt: any; // Timestamp
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: any; // Timestamp
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: any; // Timestamp
  status: 'active' | 'closed';
  userId: string;
}
