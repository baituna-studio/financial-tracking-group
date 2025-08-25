import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string;
          color: string;
          group_id: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string;
          color?: string;
          group_id: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          group_id?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          title: string;
          amount: number;
          category_id: string;
          group_id: string;
          start_date: string;
          end_date: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          amount: number;
          category_id: string;
          group_id: string;
          start_date: string;
          end_date: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          amount?: number;
          category_id?: string;
          group_id?: string;
          start_date?: string;
          end_date?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          amount: number;
          category_id: string;
          group_id: string;
          expense_date: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          amount: number;
          category_id: string;
          group_id: string;
          expense_date?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          amount?: number;
          category_id?: string;
          group_id?: string;
          expense_date?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
