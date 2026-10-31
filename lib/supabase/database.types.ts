// Hand-written to match supabase/migrations. Same shape as `supabase gen types typescript`;
// it can be regenerated with the Supabase CLI later. Keep in sync when the schema changes.

type KeyValueTable = {
  Row: { key: string; value: string };
  Insert: { key: string; value?: string };
  Update: { key?: string; value?: string };
  Relationships: [];
};

export type PhotoSlot = "banner" | "p1" | "p2" | "p3" | "p4" | "og";
export type ReviewStatus = "pending" | "approved" | "hidden";

export type Database = {
  public: {
    Tables: {
      settings: KeyValueTable;
      texts: KeyValueTable;
      photos: {
        Row: {
          slot: PhotoSlot;
          path: string | null;
          alt: string;
          width: number | null;
          height: number | null;
          updated_at: string;
        };
        Insert: {
          slot: PhotoSlot;
          path?: string | null;
          alt?: string;
          width?: number | null;
          height?: number | null;
          updated_at?: string;
        };
        Update: {
          slot?: PhotoSlot;
          path?: string | null;
          alt?: string;
          width?: number | null;
          height?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      price_columns: {
        Row: { id: string; title: string; position: number };
        Insert: { id?: string; title: string; position?: number };
        Update: { id?: string; title?: string; position?: number };
        Relationships: [];
      };
      services: {
        Row: { id: string; column_id: string; name: string; price: string; position: number };
        Insert: { id?: string; column_id: string; name: string; price?: string; position?: number };
        Update: { id?: string; column_id?: string; name?: string; price?: string; position?: number };
        Relationships: [
          {
            foreignKeyName: "services_column_id_fkey";
            columns: ["column_id"];
            isOneToOne: false;
            referencedRelation: "price_columns";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          rating: number;
          name: string;
          comment: string;
          status: ReviewStatus;
          device_hash: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          rating: number;
          name: string;
          comment?: string;
          status?: ReviewStatus;
          device_hash?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          rating?: number;
          name?: string;
          comment?: string;
          status?: ReviewStatus;
          device_hash?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admins: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: {
      public_reviews: {
        Row: { id: string; rating: number; name: string; comment: string; created_at: string };
        Relationships: [];
      };
      review_stats: {
        // numeric comes back from PostgREST as a number
        Row: { average: number; count: number };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Views<T extends keyof Database["public"]["Views"]> = Database["public"]["Views"][T]["Row"];
