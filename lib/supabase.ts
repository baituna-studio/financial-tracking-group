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
          full_name: string | null;
          email: string | null;
          month_start_day: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          month_start_day?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          month_start_day?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string | null;
          description: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_groups: {
        Row: {
          id: string;
          user_id: string | null;
          group_id: string | null;
          role: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          group_id?: string | null;
          role?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          group_id?: string | null;
          role?: string | null;
          created_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string | null;
          description: string | null;
          color: string | null;
          icon: string | null;
          type: string | null;
          group_id: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          type?: string | null;
          group_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          type?: string | null;
          group_id?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      budgets: {
        Row: {
          id: string;
          title: string | null;
          amount: number | null;
          category_id: string | null;
          wallet_id: string | null;
          group_id: string | null;
          start_date: string | null;
          end_date: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title?: string | null;
          amount?: number | null;
          category_id?: string | null;
          wallet_id?: string | null;
          group_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          amount?: number | null;
          category_id?: string | null;
          wallet_id?: string | null;
          group_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      expenses: {
        Row: {
          id: string;
          title: string | null;
          description: string | null;
          amount: number | null;
          category_id: string | null;
          wallet_id: string | null;
          group_id: string | null;
          expense_date: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title?: string | null;
          description?: string | null;
          amount?: number | null;
          category_id?: string | null;
          wallet_id?: string | null;
          group_id?: string | null;
          expense_date?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          description?: string | null;
          amount?: number | null;
          category_id?: string | null;
          wallet_id?: string | null;
          group_id?: string | null;
          expense_date?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      income: {
        Row: {
          id: string;
          title: string | null;
          amount: number | null;
          category_id: string | null;
          group_id: string | null;
          income_date: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title?: string | null;
          amount?: number | null;
          category_id?: string | null;
          group_id?: string | null;
          income_date?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          amount?: number | null;
          category_id?: string | null;
          group_id?: string | null;
          income_date?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      wallet_transfers: {
        Row: {
          id: string;
          title: string | null;
          description: string | null;
          amount: number | null;
          from_wallet_id: string | null;
          to_wallet_id: string | null;
          group_id: string | null;
          transfer_date: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title?: string | null;
          description?: string | null;
          amount?: number | null;
          from_wallet_id?: string | null;
          to_wallet_id?: string | null;
          group_id?: string | null;
          transfer_date?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          description?: string | null;
          amount?: number | null;
          from_wallet_id?: string | null;
          to_wallet_id?: string | null;
          group_id?: string | null;
          transfer_date?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
};
