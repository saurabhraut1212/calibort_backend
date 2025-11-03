export type Provider = "local" | "reqres";
export type Role = "admin" | "user";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash?: string | null;
  avatar_url?: string | null;
  provider: Provider;
  reqres_id?: number | null;
  role: Role; 
  created_at: string;
  updated_at: string;
}
