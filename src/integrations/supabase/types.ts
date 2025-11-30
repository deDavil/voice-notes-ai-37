export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          additional_notes: string | null
          birthday: string | null
          company: string | null
          company_website: string | null
          created_at: string
          email: string | null
          follow_up_actions: string[] | null
          follow_up_enabled: boolean | null
          follow_up_frequency: string | null
          how_i_can_help: string | null
          how_they_can_help: string | null
          how_we_met: string | null
          id: string
          important_facts: string[] | null
          instagram_url: string | null
          introduced_by: string | null
          is_favorite: boolean | null
          last_interaction_at: string | null
          linkedin_url: string | null
          location: string | null
          name: string | null
          next_follow_up_at: string | null
          original_transcription: string | null
          phone: string | null
          photo_url: string | null
          priority: string | null
          profession_or_role: string | null
          relationship_type: string | null
          tags: string[] | null
          twitter_url: string | null
          updated_at: string
          user_id: string | null
          warmth_level: string | null
          website_url: string | null
        }
        Insert: {
          additional_notes?: string | null
          birthday?: string | null
          company?: string | null
          company_website?: string | null
          created_at?: string
          email?: string | null
          follow_up_actions?: string[] | null
          follow_up_enabled?: boolean | null
          follow_up_frequency?: string | null
          how_i_can_help?: string | null
          how_they_can_help?: string | null
          how_we_met?: string | null
          id?: string
          important_facts?: string[] | null
          instagram_url?: string | null
          introduced_by?: string | null
          is_favorite?: boolean | null
          last_interaction_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          next_follow_up_at?: string | null
          original_transcription?: string | null
          phone?: string | null
          photo_url?: string | null
          priority?: string | null
          profession_or_role?: string | null
          relationship_type?: string | null
          tags?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
          warmth_level?: string | null
          website_url?: string | null
        }
        Update: {
          additional_notes?: string | null
          birthday?: string | null
          company?: string | null
          company_website?: string | null
          created_at?: string
          email?: string | null
          follow_up_actions?: string[] | null
          follow_up_enabled?: boolean | null
          follow_up_frequency?: string | null
          how_i_can_help?: string | null
          how_they_can_help?: string | null
          how_we_met?: string | null
          id?: string
          important_facts?: string[] | null
          instagram_url?: string | null
          introduced_by?: string | null
          is_favorite?: boolean | null
          last_interaction_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          next_follow_up_at?: string | null
          original_transcription?: string | null
          phone?: string | null
          photo_url?: string | null
          priority?: string | null
          profession_or_role?: string | null
          relationship_type?: string | null
          tags?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
          warmth_level?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          connection_id: string | null
          created_at: string
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          company_website: string | null
          created_at: string
          default_follow_up_frequency: string | null
          default_view: string | null
          email_notifications: boolean | null
          full_name: string | null
          id: string
          industries: string[] | null
          interests: string[] | null
          linkedin_url: string | null
          location: string | null
          profession_or_role: string | null
          show_follow_up_reminders: boolean | null
          topics: string[] | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          company_website?: string | null
          created_at?: string
          default_follow_up_frequency?: string | null
          default_view?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          industries?: string[] | null
          interests?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          profession_or_role?: string | null
          show_follow_up_reminders?: boolean | null
          topics?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          company_website?: string | null
          created_at?: string
          default_follow_up_frequency?: string | null
          default_view?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          industries?: string[] | null
          interests?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          profession_or_role?: string | null
          show_follow_up_reminders?: boolean | null
          topics?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          completed_at: string | null
          connection_id: string
          created_at: string
          id: string
          is_completed: boolean | null
          text: string
          type: string
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          text: string
          type: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          text?: string
          type?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          completed_at: string | null
          connection_id: string
          created_at: string
          id: string
          is_completed: boolean | null
          text: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          text: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          text?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "todos_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
