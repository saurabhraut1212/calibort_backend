import { upsertUsersBulk } from "../db/importQueries";

type ReqresUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
};

type ReqresResponse = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: ReqresUser[];
};

const REQRES_BASE = "https://reqres.in/api";

export async function importReqresPage(page = 1): Promise<{ page: number; imported: number }> {
  const res = await fetch(`${REQRES_BASE}/users?page=${page}`);
  if (!res.ok) {
    throw new Error(`Reqres fetch failed: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as ReqresResponse;

  const rows = body.data.map((u) => ({
    name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
    email: u.email,
    avatar_url: u.avatar ?? null,
    reqres_id: u.id ?? null
  }));

  await upsertUsersBulk(rows);
  return { page: body.page, imported: rows.length };
}
