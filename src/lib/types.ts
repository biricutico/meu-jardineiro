// Tipos e interfaces do MEUJARDINEIRO

export type UserType = 'cliente' | 'prestador' | 'admin';

export type ServiceStatus = 
  | 'aguardando_aceite'
  | 'negociando'
  | 'aceito'
  | 'a_caminho'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado';

export type ServiceType = 
  | 'rocagem'
  | 'poda'
  | 'jardinagem'
  | 'limpeza_lote'
  | 'manutencao'
  | 'outro';

export interface User {
  id: string;
  type: UserType;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface Cliente extends User {
  type: 'cliente';
}

export interface Prestador extends User {
  type: 'prestador';
  cpfCnpj: string;
  companyName?: string;
  specialties: ServiceType[];
  portfolio: string[];
  availability: string;
  rating: number;
  totalServices: number;
}

export interface ServiceOrder {
  id: string;
  clienteId: string;
  prestadorId?: string;
  type: ServiceType;
  description: string;
  area: string;
  photos: string[];
  address: string;
  latitude?: number;
  longitude?: number;
  desiredDate?: Date;
  status: ServiceStatus;
  clienteProposedValue?: number;
  prestadorProposedValue?: number;
  finalValue?: number;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Negotiation {
  id: string;
  orderId: string;
  userId: string;
  userType: UserType;
  proposedValue: number;
  message?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  senderType: UserType;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  prestadorId: string;
  clienteId: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: Date;
}
