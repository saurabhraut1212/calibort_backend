export type Provider = "local" | "reqres";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash?: string | null;
  avatar_url?: string | null;
  provider: Provider;
  reqres_id?: number | null;  
  created_at: string;
  updated_at: string;
}
