import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos do banco de dados
export type Database = {
  users: {
    id: string;
    type: 'cliente' | 'prestador' | 'admin';
    name: string;
    email: string;
    phone: string;
    address: string;
    cpf_cnpj?: string;
    company_name?: string;
    specialties?: string[];
    portfolio?: string[];
    availability?: string;
    rating: number;
    total_services: number;
    created_at: string;
  };
  service_orders: {
    id: string;
    cliente_id: string;
    prestador_id?: string;
    type: string;
    description: string;
    area: string;
    photos: string[];
    address: string;
    latitude?: number;
    longitude?: number;
    desired_date?: string;
    status: string;
    cliente_proposed_value?: number;
    prestador_proposed_value?: number;
    final_value?: number;
    rating?: number;
    review?: string;
    created_at: string;
    updated_at: string;
  };
  negotiations: {
    id: string;
    order_id: string;
    user_id: string;
    user_type: 'cliente' | 'prestador';
    proposed_value: number;
    message?: string;
    created_at: string;
  };
  messages: {
    id: string;
    order_id: string;
    sender_id: string;
    sender_type: 'cliente' | 'prestador';
    content: string;
    read: boolean;
    created_at: string;
  };
};
